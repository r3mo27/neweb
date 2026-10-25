import * as THREE from 'three';
import { createPaperPath, randomSource, type PaperPath } from './crumple-path';

type Spring = { value: number; target: number; velocity: number };
const spring = (value = 0): Spring => ({ value, target: value, velocity: 0 });
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
function advance(s: Spring, dt: number, duration: number, instant: boolean) {
  if (instant || duration <= 0) {
    s.value = s.target;
    s.velocity = 0;
    return false;
  }
  const omega = 8 / Math.max(0.06, duration);
  const offset = s.value - s.target;
  const term = s.velocity + omega * offset;
  const decay = Math.exp(-omega * dt);
  s.value = s.target + (offset + term * dt) * decay;
  s.velocity = (s.velocity - omega * term * dt) * decay;
  if (Math.abs(s.value - s.target) < 0.0001 && Math.abs(s.velocity) < 0.001) {
    s.value = s.target;
    s.velocity = 0;
    return false;
  }
  return true;
}

export type SheetSource = { canvas: HTMLCanvasElement; width: number; height: number; seed: number };
/** Dónde está la hoja en pantalla: centro en px del viewport, escala y giro en grados. */
export type SheetPose = { x: number; y: number; scale: number; rotation: number };
export type GrabRequest = {
  pointerId: number;
  clientX: number;
  clientY: number;
  /** Se consulta en cada frame: si la hoja se mueve (scroll, hover), la bola vuelve a donde esté. */
  pose: () => SheetPose;
  onRelease: () => void;
  /** La hoja ya está plana y en su sitio: se puede volver a enseñar el HTML. */
  onRest: () => void;
};

const CRUMPLE = 0.88;
const CRUMPLE_TIME = 0.55;
const RELEASE_TIME = 0.42;
const MOVE_TIME = 0.42;
const FOLDS = 7;
const SHARPNESS = 0.6;
const DEPTH = 0.7;
const RESOLUTION = 16;
const DRAG_TILT = THREE.MathUtils.degToRad(12);
const PAPER = '#f2efe6';
const SHADOW = 0.25;
const FADE_MS = 200;

type Sheet = {
  source: SheetSource;
  texture: THREE.Texture | null;
  geometry: THREE.BufferGeometry;
  original: Float32Array;
  positions: Float32Array;
  indices: number[];
  renderPositions: Float32Array;
  renderNormals: Float32Array;
  faceNormals: Float32Array;
  incidentFaces: number[][];
  count: number;
  aspect: number;
  shortSide: number;
  path: PaperPath | null;
};

function buildSheet(source: SheetSource): Sheet {
  const aspect = source.height / source.width;
  const shortSide = Math.min(1, aspect);
  const columns = Math.max(8, Math.round(RESOLUTION / Math.max(1, aspect)));
  const rows = Math.max(8, Math.round(RESOLUTION * Math.min(1, aspect)));
  const rng = randomSource(source.seed);
  const count = (columns + 1) * (rows + 1);
  const original = new Float32Array(count * 3);
  const uvs = new Float32Array(count * 2);
  const indices: number[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      const index = row * (columns + 1) + col;
      const u = (col + (col > 0 && col < columns ? (rng() - 0.5) * 0.5 : 0)) / columns;
      const v = (row + (row > 0 && row < rows ? (rng() - 0.5) * 0.5 : 0)) / rows;
      original[index * 3] = u - 0.5;
      original[index * 3 + 1] = (v - 0.5) * aspect;
      uvs[index * 2] = u;
      uvs[index * 2 + 1] = v;
      if (col < columns && row < rows) {
        const a = index,
          b = index + 1,
          c = index + columns + 1,
          d = c + 1;
        if (rng() > 0.5) indices.push(a, b, d, a, d, c);
        else indices.push(a, b, c, b, d, c);
      }
    }
  }
  const renderPositions = new Float32Array(indices.length * 3);
  const renderNormals = new Float32Array(indices.length * 3);
  const renderUvs = new Float32Array(indices.length * 2);
  const incidentFaces: number[][] = Array.from({ length: count }, () => []);
  for (let i = 0; i < indices.length; i++) {
    renderUvs[i * 2] = uvs[indices[i] * 2];
    renderUvs[i * 2 + 1] = uvs[indices[i] * 2 + 1];
    incidentFaces[indices[i]].push(Math.floor(i / 3) * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(renderPositions, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('normal', new THREE.BufferAttribute(renderNormals, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('uv', new THREE.BufferAttribute(renderUvs, 2));
  return {
    source,
    texture: null,
    geometry,
    original,
    positions: new Float32Array(count * 3),
    indices,
    renderPositions,
    renderNormals,
    faceNormals: new Float32Array(indices.length),
    incidentFaces,
    count,
    aspect,
    shortSide,
    path: null
  };
}

/** Solo por si se agarra la hoja antes de que responda el worker: aquí sí bloquea. */
function ensurePath(sheet: Sheet) {
  sheet.path ??= createPaperPath(sheet.original, sheet.indices, sheet.shortSide, FOLDS, SHARPNESS, DEPTH, sheet.source.seed);
  return sheet.path;
}

/* La simulación del arrugado tarda cientos de ms por hoja: se calcula en un worker */
let worker: Worker | null | undefined;
let jobId = 0;
const jobs = new Map<number, Sheet>();

function getWorker() {
  if (worker !== undefined) return worker;
  try {
    worker = new Worker(new URL('./crumple.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<{ id: number; path: PaperPath }>) => {
      const sheet = jobs.get(event.data.id);
      jobs.delete(event.data.id);
      if (sheet) sheet.path ??= event.data.path;
    };
    worker.onerror = () => {
      worker?.terminate();
      worker = null;
      jobs.clear();
    };
  } catch {
    worker = null;
  }
  return worker;
}

function requestPath(sheet: Sheet) {
  const w = getWorker();
  if (!w) return;
  const id = ++jobId;
  jobs.set(id, sheet);
  w.postMessage({
    id,
    rest: sheet.original,
    triangles: sheet.indices,
    shortSide: sheet.shortSide,
    density: FOLDS,
    sharpness: SHARPNESS,
    depth: DEPTH,
    seed: sheet.source.seed
  });
}

const idle = (fn: () => void) => {
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: 1500 });
  else setTimeout(fn, 200);
};

/**
 * Un único lienzo WebGL a pantalla completa para todas las hojas: solo se arruga una a la vez,
 * así que comparten renderer, shaders y luces. Cada hoja registra su textura y su malla, y al
 * agarrarla el motor la pinta encima de todo, en la posición exacta que tiene en la página.
 */
class CrumpleEngine {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20000);
  private readonly group = new THREE.Group();
  private readonly front: THREE.Mesh;
  private readonly back: THREE.Mesh;
  private readonly frontMaterial: THREE.MeshStandardMaterial;
  private readonly backMaterial: THREE.MeshStandardMaterial;
  private readonly depthMaterial: THREE.MeshDepthMaterial;
  private readonly grain: THREE.DataTexture;
  private readonly light: THREE.DirectionalLight;
  private readonly floor: THREE.Mesh;
  private readonly lighting = { value: 0 };
  private readonly sheets = new Map<string, Sheet>();
  private sheet: Sheet | null = null;
  private request: GrabRequest | null = null;
  private pose: SheetPose = { x: 0, y: 0, scale: 1, rotation: 0 };
  private compiled = false;

  private readonly amount = spring();
  private readonly memory = spring();
  private readonly posX = spring();
  private readonly posY = spring();
  private readonly tiltX = spring();
  private readonly tiltY = spring();
  private readonly springs = [this.amount, this.memory, this.posX, this.posY, this.tiltX, this.tiltY];

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private readonly anchor = new THREE.Vector3();
  private readonly world = new THREE.Vector3();
  private readonly corner = new THREE.Vector3();
  private readonly a = new THREE.Vector3();
  private readonly b = new THREE.Vector3();
  private readonly c = new THREE.Vector3();
  private readonly weights = new THREE.Vector3(1, 0, 0);
  private grip = [0, 0, 0];

  private width = 1;
  private height = 1;
  private held = false;
  private rested = true;
  private contextLost = false;
  private pointerId: number | null = null;
  private pointerX = 0;
  private pointerY = 0;
  private lastX = 0;
  private lastY = 0;
  private lastMove = 0;
  private frame = 0;
  private lastTime = 0;
  private fadeUntil = 0;
  private previousAmount = -1;
  private previousMemory = -1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    const rng = randomSource(11);
    const grainData = new Uint8Array(128 * 128 * 4);
    for (let i = 0; i < grainData.length; i += 4) {
      const value = 100 + Math.floor(rng() * 155);
      grainData[i] = grainData[i + 1] = grainData[i + 2] = value;
      grainData[i + 3] = 255;
    }
    this.grain = new THREE.DataTexture(grainData, 128, 128);
    this.grain.wrapS = this.grain.wrapT = THREE.RepeatWrapping;
    this.grain.magFilter = this.grain.minFilter = THREE.LinearFilter;
    this.grain.needsUpdate = true;

    const materialOptions = {
      roughness: 0.92,
      metalness: 0,
      bumpMap: this.grain,
      bumpScale: 0.08 * 0.32,
      alphaTest: 0.04,
      alphaToCoverage: true,
      flatShading: false
    };
    this.frontMaterial = new THREE.MeshStandardMaterial({ ...materialOptions, side: THREE.FrontSide });
    this.backMaterial = new THREE.MeshStandardMaterial({ ...materialOptions, side: THREE.BackSide, color: PAPER });
    for (const material of [this.frontMaterial, this.backMaterial]) {
      const isBack = material === this.backMaterial;
      material.onBeforeCompile = shader => {
        shader.uniforms.paperLighting = this.lighting;
        shader.fragmentShader = 'uniform float paperLighting;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <map_fragment>',
          `
          #include <map_fragment>
          #ifdef USE_MAP
            if (vMapUv.x < 0.0 || vMapUv.x > 1.0 || vMapUv.y < 0.0 || vMapUv.y > 1.0) discard;
            ${isBack ? 'diffuseColor.rgb = diffuse;' : ''}
          #endif
        `
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <opaque_fragment>',
          `
          outgoingLight = mix(diffuseColor.rgb, outgoingLight, paperLighting);
          #include <opaque_fragment>
        `
        );
      };
      material.customProgramCacheKey = () => `paper-${isBack ? 'stock' : 'print'}`;
    }
    this.depthMaterial = new THREE.MeshDepthMaterial({
      depthPacking: THREE.RGBADepthPacking,
      alphaTest: 0.04,
      side: THREE.DoubleSide
    });
    this.depthMaterial.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `
        #include <map_fragment>
        #ifdef USE_MAP
          if (vMapUv.x < 0.0 || vMapUv.x > 1.0 || vMapUv.y < 0.0 || vMapUv.y > 1.0) discard;
        #endif
      `
      );
    };

    const placeholder = new THREE.BufferGeometry();
    this.front = new THREE.Mesh(placeholder, this.frontMaterial);
    this.back = new THREE.Mesh(placeholder, this.backMaterial);
    this.front.castShadow = true;
    this.front.receiveShadow = true;
    this.back.receiveShadow = true;
    this.front.customDepthMaterial = this.depthMaterial;
    this.group.add(this.front, this.back);
    this.scene.add(this.group);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0xa4a0b0, 1.35));
    this.light = new THREE.DirectionalLight(0xfffaf0, 1.8);
    this.light.castShadow = true;
    this.light.shadow.mapSize.set(2048, 2048);
    this.light.shadow.bias = -0.0002;
    this.light.shadow.normalBias = 0.6;
    this.light.shadow.radius = 3;
    this.scene.add(this.light, this.light.target);
    this.floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShadowMaterial({ opacity: SHADOW, depthWrite: false })
    );
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('blur', this.cancel);
    document.addEventListener('visibilitychange', this.visibility);
    canvas.addEventListener('webglcontextlost', this.loseContext);
    canvas.addEventListener('webglcontextrestored', this.restoreContext);
  }

  /** Registra (o actualiza) la textura y el tamaño de una hoja; a partir de aquí ya se puede agarrar. */
  prepare(key: string, source: SheetSource) {
    let sheet = this.sheets.get(key);
    const sameShape =
      sheet &&
      sheet.source.width === source.width &&
      sheet.source.height === source.height &&
      sheet.source.seed === source.seed;
    if (!sheet || !sameShape) {
      const previous = sheet;
      sheet = buildSheet(source);
      if (previous) {
        sheet.texture = previous.texture;
        if (this.sheet === previous) this.use(sheet, false);
        previous.geometry.dispose();
      }
      this.sheets.set(key, sheet);
      requestPath(sheet);
    }
    sheet.source = source;
    const texture = new THREE.CanvasTexture(source.canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    const old = sheet.texture;
    sheet.texture = texture;
    if (this.sheet === sheet) this.applyMaps(texture);
    if (old && old !== texture) old.dispose();
    this.warmUp(sheet);
    // La subida a la GPU, en otro hueco libre: así no se suma al trabajo de pintar la textura.
    idle(() => sheet.texture === texture && this.renderer.initTexture(texture));
  }

  forget(key: string) {
    const sheet = this.sheets.get(key);
    if (!sheet) return;
    if (this.sheet === sheet) {
      this.release();
      this.request = null;
      this.sheet = null;
      this.hide(true);
    }
    this.sheets.delete(key);
    sheet.geometry.dispose();
    sheet.texture?.dispose();
  }

  /** Empieza a arrugar la hoja si el puntero cae sobre ella. */
  grab(key: string, request: GrabRequest) {
    const sheet = this.sheets.get(key);
    if (!sheet?.texture || this.held || this.contextLost) return false;
    if (this.sheet !== sheet) {
      if (!this.rested) this.request?.onRest();
      this.use(sheet, true);
    } else if (this.rested) {
      for (const s of this.springs) s.value = s.target = s.velocity = 0;
    }
    ensurePath(sheet);
    this.request = request;
    this.pose = request.pose();
    this.previousAmount = -1;
    this.deform(sheet);
    this.place(sheet);

    this.setPointer(request.clientX, request.clientY);
    const intersection = this.raycaster.intersectObjects([this.front, this.back], false)[0];
    if (!intersection?.face) return false;
    const { face } = intersection;
    this.grip = [face.a, face.b, face.c];
    const attribute = sheet.geometry.attributes.position;
    this.a.fromBufferAttribute(attribute, face.a);
    this.b.fromBufferAttribute(attribute, face.b);
    this.c.fromBufferAttribute(attribute, face.c);
    THREE.Triangle.getBarycoord(this.group.worldToLocal(intersection.point.clone()), this.a, this.b, this.c, this.weights);

    this.held = true;
    this.rested = false;
    this.pointerId = request.pointerId;
    this.pointerX = this.lastX = request.clientX;
    this.pointerY = this.lastY = request.clientY;
    this.lastMove = performance.now();
    this.amount.target = CRUMPLE;
    window.addEventListener('pointermove', this.move);
    window.addEventListener('pointerup', this.up);
    window.addEventListener('pointercancel', this.up);
    document.documentElement.classList.add('is-grabbing');

    this.canvas.style.transition = 'none';
    this.canvas.style.opacity = '1';
    this.draw();
    this.wake();
    return true;
  }

  private use(sheet: Sheet, reset: boolean) {
    this.sheet = sheet;
    this.front.geometry = this.back.geometry = sheet.geometry;
    this.grain.repeat.set(5, 5 * sheet.aspect);
    if (sheet.texture) this.applyMaps(sheet.texture);
    this.previousAmount = -1;
    if (reset) for (const s of this.springs) s.value = s.target = s.velocity = 0;
  }

  private applyMaps(texture: THREE.Texture) {
    const fresh = !this.frontMaterial.map;
    this.frontMaterial.map = this.backMaterial.map = this.depthMaterial.map = texture;
    if (fresh) this.frontMaterial.needsUpdate = this.backMaterial.needsUpdate = this.depthMaterial.needsUpdate = true;
  }

  /** Compila los shaders con la primera textura para que el primer agarre no dé tirón. */
  private warmUp(sheet: Sheet) {
    if (this.compiled || this.sheet) return;
    this.compiled = true;
    this.use(sheet, true);
    // compileAsync no cubre la pasada de sombras: un render invisible la compila antes del primer agarre.
    this.renderer
      .compileAsync(this.scene, this.camera)
      .catch(() => {})
      .then(() => idle(() => !this.held && this.rested && this.renderer.render(this.scene, this.camera)));
  }

  private deform(sheet: Sheet) {
    if (this.amount.value === this.previousAmount && this.memory.value === this.previousMemory) return;
    this.previousAmount = this.amount.value;
    this.previousMemory = this.memory.value;
    const path = ensurePath(sheet);
    const { positions, original, indices, faceNormals, incidentFaces, renderPositions, renderNormals } = sheet;
    const fold = clamp(this.amount.value, 0, 1);
    const frame = fold * (path.samples.length - 1);
    const lower = Math.floor(frame);
    const upper = Math.min(lower + 1, path.samples.length - 1);
    const mix = frame - lower;
    const from = path.samples[lower];
    const to = path.samples[upper];
    for (let i = 0; i < positions.length; i++) {
      positions[i] = from[i] + (to[i] - from[i]) * mix;
      positions[i] += (path.creased[i] - original[i]) * this.memory.value * (1 - fold);
    }
    for (let face = 0; face < indices.length; face += 3) {
      const a = indices[face] * 3,
        b = indices[face + 1] * 3,
        c = indices[face + 2] * 3;
      const bx = positions[b] - positions[a],
        by = positions[b + 1] - positions[a + 1],
        bz = positions[b + 2] - positions[a + 2];
      const cx = positions[c] - positions[a],
        cy = positions[c + 1] - positions[a + 1],
        cz = positions[c + 2] - positions[a + 2];
      const nx = by * cz - bz * cy,
        ny = bz * cx - bx * cz,
        nz = bx * cy - by * cx;
      const length = Math.hypot(nx, ny, nz) || 1;
      faceNormals[face] = nx / length;
      faceNormals[face + 1] = ny / length;
      faceNormals[face + 2] = nz / length;
    }
    for (let i = 0; i < indices.length; i++) {
      const source = indices[i] * 3;
      const face = Math.floor(i / 3) * 3;
      let nx = 0,
        ny = 0,
        nz = 0;
      for (const neighbor of incidentFaces[indices[i]]) {
        const dot =
          faceNormals[face] * faceNormals[neighbor] +
          faceNormals[face + 1] * faceNormals[neighbor + 1] +
          faceNormals[face + 2] * faceNormals[neighbor + 2];
        const weight = THREE.MathUtils.smoothstep(dot, 0.88 - (1 - SHARPNESS) * 0.18, 0.98);
        nx += faceNormals[neighbor] * weight;
        ny += faceNormals[neighbor + 1] * weight;
        nz += faceNormals[neighbor + 2] * weight;
      }
      const length = Math.hypot(nx, ny, nz) || 1;
      renderPositions[i * 3] = positions[source];
      renderPositions[i * 3 + 1] = positions[source + 1];
      renderPositions[i * 3 + 2] = positions[source + 2];
      renderNormals[i * 3] = nx / length;
      renderNormals[i * 3 + 1] = ny / length;
      renderNormals[i * 3 + 2] = nz / length;
    }
    sheet.geometry.attributes.position.needsUpdate = true;
    sheet.geometry.attributes.normal.needsUpdate = true;
    sheet.geometry.computeBoundingSphere();
    sheet.geometry.computeBoundingBox();
    this.lighting.value = THREE.MathUtils.smoothstep(fold + this.memory.value, 0, 0.4);
  }

  /** Coloca la hoja: en reposo encima de su HTML; agarrada, con el punto de agarre bajo el cursor. */
  private place(sheet: Sheet) {
    const scale = sheet.source.width * this.pose.scale;
    const restX = this.pose.x - this.width / 2;
    const restY = this.height / 2 - this.pose.y;
    this.group.scale.setScalar(scale);
    this.group.rotation.set(this.tiltX.value, this.tiltY.value, -THREE.MathUtils.degToRad(this.pose.rotation));
    if (this.held) {
      const attribute = sheet.geometry.attributes.position;
      this.anchor.set(0, 0, 0);
      for (let i = 0; i < 3; i++) {
        this.a.fromBufferAttribute(attribute, this.grip[i]);
        this.anchor.addScaledVector(this.a, this.weights.getComponent(i));
      }
      this.anchor.multiplyScalar(scale).applyEuler(this.group.rotation);
      this.plane.constant = -this.anchor.z;
      this.setPointer(this.pointerX, this.pointerY);
      if (this.raycaster.ray.intersectPlane(this.plane, this.world)) {
        this.posX.value = this.posX.target = this.world.x - this.anchor.x - restX;
        this.posY.value = this.posY.target = this.world.y - this.anchor.y - restY;
        this.posX.velocity = this.posY.velocity = 0;
      }
    }
    this.group.position.set(restX + this.posX.value, restY + this.posY.value, 0);
    this.group.updateMatrixWorld(true);
    const bounds = sheet.geometry.boundingBox;
    if (bounds) {
      let backZ = Infinity;
      for (let i = 0; i < 8; i++) {
        this.corner.set(
          i & 1 ? bounds.max.x : bounds.min.x,
          i & 2 ? bounds.max.y : bounds.min.y,
          i & 4 ? bounds.max.z : bounds.min.z
        );
        this.corner.applyMatrix4(this.group.matrixWorld);
        backZ = Math.min(backZ, this.corner.z);
      }
      this.floor.position.set(this.group.position.x, this.group.position.y, backZ - scale * sheet.shortSide * 0.08);
    }
  }

  private draw() {
    const sheet = this.sheet;
    if (!sheet) return;
    this.deform(sheet);
    this.place(sheet);
    this.renderer.render(this.scene, this.camera);
  }

  private tick = (time: number) => {
    this.frame = 0;
    if (!this.sheet || this.contextLost) return;
    const dt = this.lastTime ? Math.min(0.04, (time - this.lastTime) / 1000) : 1 / 60;
    this.lastTime = time;
    const duration = this.held ? CRUMPLE_TIME : RELEASE_TIME;
    let moving = false;
    for (const s of this.springs)
      moving = advance(s, dt, s === this.amount || s === this.memory ? duration : MOVE_TIME, false) || moving;
    if (this.request) this.pose = this.request.pose();
    this.draw();
    if (
      !this.held &&
      !this.rested &&
      this.amount.value < 0.004 &&
      Math.abs(this.posX.value) < 0.75 &&
      Math.abs(this.posY.value) < 0.75 &&
      Math.abs(this.tiltX.value) + Math.abs(this.tiltY.value) < 0.004
    ) {
      this.rested = true;
      this.request?.onRest();
      this.hide(false);
      this.fadeUntil = time + FADE_MS + 50;
    }
    if (moving || this.held || time < this.fadeUntil) this.wake();
    else this.lastTime = 0;
  };

  private wake() {
    if (!this.frame && this.sheet && !this.contextLost) this.frame = requestAnimationFrame(this.tick);
  }

  private hide(instant: boolean) {
    this.canvas.style.transition = instant ? 'none' : `opacity ${FADE_MS}ms ease-out`;
    this.canvas.style.opacity = '0';
  }

  private setPointer(x: number, y: number) {
    this.pointer.set((x / this.width) * 2 - 1, 1 - (y / this.height) * 2);
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private move = (event: PointerEvent) => {
    if (!this.held || event.pointerId !== this.pointerId) return;
    const now = performance.now();
    const dt = Math.max(0.008, (now - this.lastMove) / 1000);
    const speedX = (event.clientX - this.lastX) / dt;
    const speedY = (event.clientY - this.lastY) / dt;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.lastMove = now;
    this.pointerX = clamp(event.clientX, 0, this.width);
    this.pointerY = clamp(event.clientY, 0, this.height);
    this.tiltX.target = clamp(speedY / 1800, -1, 1) * DRAG_TILT;
    this.tiltY.target = clamp(speedX / 1800, -1, 1) * DRAG_TILT;
    this.wake();
  };

  private up = (event: PointerEvent) => {
    if (event.pointerId === this.pointerId) this.release();
  };

  private release() {
    if (!this.held) return;
    this.held = false;
    this.pointerId = null;
    window.removeEventListener('pointermove', this.move);
    window.removeEventListener('pointerup', this.up);
    window.removeEventListener('pointercancel', this.up);
    document.documentElement.classList.remove('is-grabbing');
    this.amount.target = 0;
    this.memory.target = 0;
    this.tiltX.target = this.tiltY.target = 0;
    this.posX.target = this.posY.target = 0;
    this.request?.onRelease();
    this.wake();
  }

  private cancel = () => this.release();

  private visibility = () => {
    this.lastTime = 0;
    if (document.hidden) this.release();
  };

  private loseContext = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
    this.release();
    this.hide(true);
    if (!this.rested) {
      this.rested = true;
      this.request?.onRest();
    }
  };

  private restoreContext = () => {
    this.contextLost = false;
  };

  private resize = () => {
    this.width = Math.max(1, this.canvas.clientWidth);
    this.height = Math.max(1, this.canvas.clientHeight);
    this.camera.aspect = this.width / this.height;
    this.camera.position.z = this.height / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.width, this.height, false);
    const reach = Math.max(this.width, this.height);
    const angle = THREE.MathUtils.degToRad(-35);
    this.light.position.set(Math.sin(angle) * reach, Math.cos(angle) * reach, reach * 4);
    const cam = this.light.shadow.camera;
    cam.left = cam.bottom = -reach;
    cam.right = cam.top = reach;
    cam.near = 1;
    cam.far = reach * 6;
    cam.updateProjectionMatrix();
    this.floor.scale.set(this.width * 4, this.height * 4, 1);
    this.wake();
  };
}

let engine: CrumpleEngine | null | undefined;

/** El motor compartido; `null` si el navegador no tiene WebGL. */
export function getCrumpleEngine() {
  if (engine !== undefined) return engine;
  document.getElementById('crumple-layer')?.remove();
  const canvas = document.createElement('canvas');
  canvas.id = 'crumple-layer';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '60',
    opacity: '0',
    filter: `drop-shadow(0 6px 10px rgb(0 0 0 / ${SHADOW}))`
  });
  document.body.appendChild(canvas);
  try {
    engine = new CrumpleEngine(canvas);
  } catch {
    canvas.remove();
    engine = null;
  }
  return engine;
}

export type { CrumpleEngine };
