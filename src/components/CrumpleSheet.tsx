"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { CrumpleEngine, SheetPose } from "@/lib/crumple";

/* Solo con ratón y pantalla grande: en táctil agarrar la hoja secuestraría el scroll */
const CAN_CRUMPLE =
  "(hover: hover) and (pointer: fine) and (min-width: 768px) and (prefers-reduced-motion: no-preference)";
function subscribeMedia(onChange: () => void) {
  const media = window.matchMedia(CAN_CRUMPLE);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}
function useCanCrumple() {
  return useSyncExternalStore(
    subscribeMedia,
    () => window.matchMedia(CAN_CRUMPLE).matches,
    () => false,
  );
}

/*
 * Preparar las hojas (cargar three.js, crear el contexto WebGL, pintar cada textura) son
 * tareas de decenas de ms. Se hacen de una en una, en huecos libres del navegador y solo
 * cuando no se está haciendo scroll, para que nunca coincidan con una animación.
 */
const START_DELAY = 2500;
const QUIET_MS = 450;
let lastScroll = 0;
let listening = false;
const queue: (() => void)[] = [];
let pumping = false;

function whenQuiet(fn: () => void) {
  if (!listening) {
    listening = true;
    const mark = () => (lastScroll = performance.now());
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("wheel", mark, { passive: true });
  }
  const check = () => {
    const wait = Math.max(START_DELAY - performance.now(), lastScroll + QUIET_MS - performance.now());
    if (wait > 0) window.setTimeout(check, wait);
    else if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(fn, { timeout: 1000 });
    else window.setTimeout(fn, 0);
  };
  check();
}

function pump() {
  pumping = true;
  whenQuiet(() => {
    queue.shift()?.();
    if (queue.length) pump();
    else pumping = false;
  });
}

function schedule(task: () => void) {
  queue.push(task);
  if (!pumping) pump();
}

let enginePromise: Promise<CrumpleEngine | null> | null = null;
const loadEngine = () =>
  (enginePromise ??= new Promise<void>((resolve) => schedule(resolve))
    .then(() => import("@/lib/crumple"))
    .then((m) => new Promise<CrumpleEngine | null>((resolve) => schedule(() => resolve(m.getCrumpleEngine())))));

const STRETCH: [number, string][] = [
  [50, "ultra-condensed"],
  [62.5, "extra-condensed"],
  [75, "condensed"],
  [87.5, "semi-condensed"],
  [100, "normal"],
  [112.5, "semi-expanded"],
  [125, "expanded"],
];
function stretchKeyword(value: string) {
  const pct = parseFloat(value);
  if (!Number.isFinite(pct)) return "normal";
  return STRETCH.reduce((best, s) => (Math.abs(s[0] - pct) < Math.abs(best[0] - pct) ? s : best))[1];
}

function paintPaper(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  /* Mismas capas que .paper en globals.css: rayas cada 24px desde abajo y brillo arriba a la izquierda */
  ctx.fillStyle = "rgba(17, 20, 46, 0.035)";
  for (let y = h - 24; y > -1; y -= 24) ctx.fillRect(0, y, w, 1);
  const glow = ctx.createRadialGradient(w * 0.2, 0, 0, w * 0.2, 0, Math.hypot(w * 0.8, h));
  glow.addColorStop(0, "rgba(255, 255, 255, 0.6)");
  glow.addColorStop(0.6, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function paintFold(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const root = getComputedStyle(document.documentElement);
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = root.getPropertyValue("--c-ink").trim() || "#11142e";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x, y + h);
  ctx.fill();
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = root.getPropertyValue("--c-navy").trim() || "#1a24a6";
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.fill();
  ctx.restore();
}

/**
 * Pinta la hoja en un canvas para usarla de textura. Se mide sobre un clon sin
 * transformar (la hoja real va girada) y cada palabra se dibuja en la caja que
 * le da el navegador, así el salto de línea es idéntico al del HTML.
 */
function snapshot(el: HTMLElement) {
  const cs = getComputedStyle(el);
  const width = parseFloat(cs.width);
  const height = parseFloat(cs.height);

  const clone = el.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${width}px`,
    height: `${height}px`,
    margin: "0px",
    transform: "none",
    visibility: "hidden",
    pointerEvents: "none",
    zIndex: "-1",
  });
  document.body.appendChild(clone);

  try {
    const base = clone.getBoundingClientRect();
    const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable");
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, parseFloat(cs.borderTopLeftRadius) || 0);
    ctx.clip();
    paintPaper(ctx, width, height, cs.backgroundColor);

    const range = document.createRange();
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    ctx.textBaseline = "alphabetic";
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement;
      const text = node.textContent ?? "";
      if (!parent || !text.trim()) continue;
      const ps = getComputedStyle(parent);
      ctx.font = `${ps.fontStyle} ${ps.fontWeight} ${ps.fontSize} ${ps.fontFamily}`;
      ctx.fontStretch = stretchKeyword(ps.fontStretch) as CanvasFontStretch;
      ctx.letterSpacing = ps.letterSpacing === "normal" ? "0px" : ps.letterSpacing;
      ctx.fillStyle = ps.color;
      const upper = ps.textTransform === "uppercase";
      for (const match of text.matchAll(/\S+/g)) {
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const rect = range.getClientRects()[0];
        if (!rect) continue;
        const word = upper ? match[0].toUpperCase() : match[0];
        const m = ctx.measureText(word);
        const ascent = m.fontBoundingBoxAscent;
        const y = rect.top - base.top + (rect.height - ascent - m.fontBoundingBoxDescent) / 2 + ascent;
        ctx.fillText(word, rect.left - base.left, y);
      }
    }

    clone.querySelectorAll<HTMLElement>("[data-fold]").forEach((fold) => {
      const r = fold.getBoundingClientRect();
      paintFold(ctx, r.left - base.left, r.top - base.top, r.width, r.height);
    });

    return { canvas, width, height };
  } finally {
    clone.remove();
  }
}

/** Centro, escala y giro reales de la hoja en pantalla, sumando las transformaciones de sus padres. */
function poseOf(el: HTMLElement): SheetPose {
  let rotation = 0;
  let scale = 1;
  for (let e: HTMLElement | null = el; e && e !== document.body; e = e.parentElement) {
    const transform = getComputedStyle(e).transform;
    if (!transform || transform === "none") continue;
    const m = new DOMMatrixReadOnly(transform);
    rotation += Math.atan2(m.b, m.a);
    scale *= Math.hypot(m.a, m.b);
  }
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    scale,
    rotation: (rotation * 180) / Math.PI,
  };
}

/**
 * Hoja que se puede arrugar: mientras está plana se ve el HTML de verdad; al
 * agarrarla la pinta el lienzo WebGL compartido, encima de toda la página, y
 * cuando la bola vuelve a su sitio y se desarruga se devuelve el HTML.
 */
export function CrumpleSheet({
  children,
  seed,
  version,
  shadow,
}: {
  children: ReactNode;
  seed: number;
  /** Cambia cuando cambia el contenido (p. ej. el idioma) para repintar la textura */
  version?: string;
  /** Sombra de la hoja (clases); va en una capa aparte para poder desvanecerla al arrugar */
  shadow?: string;
}) {
  const key = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const enabled = useCanCrumple();
  const [engine, setEngine] = useState<CrumpleEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadEngine().then((e) => alive && setEngine(e));
    return () => {
      alive = false;
    };
  }, [enabled]);

  useEffect(() => {
    const el = sheetRef.current?.firstElementChild;
    if (!engine || !enabled || !(el instanceof HTMLElement)) return;
    let cancelled = false;
    let timer = 0;
    const take = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.fonts.ready.then(() =>
          schedule(() => {
            if (cancelled) return;
            try {
              engine.prepare(key, { ...snapshot(el), seed });
              setReady(true);
            } catch {}
          }),
        );
      }, 150);
    };
    const observer = new ResizeObserver(take);
    observer.observe(el);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [engine, enabled, key, seed, version]);

  useEffect(() => {
    if (!engine) return;
    return () => engine.forget(key);
  }, [engine, key]);

  const grab = (event: PointerEvent<HTMLDivElement>) => {
    const el = sheetRef.current?.firstElementChild;
    if (!engine || !ready || event.button !== 0 || !event.isPrimary || !(el instanceof HTMLElement)) return;
    const ok = engine.grab(key, {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      pose: () => poseOf(el),
      onRelease: () => setHeld(false),
      onRest: () => setActive(false),
    });
    if (!ok) return;
    event.preventDefault();
    setHeld(true);
    setActive(true);
  };

  const live = enabled && ready;

  return (
    <div
      ref={rootRef}
      onPointerDown={live ? grab : undefined}
      className={`relative h-full ${live ? "cursor-grab select-none" : ""}`}
    >
      {shadow && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 transition-opacity ease-out ${shadow} ${
            held ? "opacity-0 duration-300" : "opacity-100 duration-500"
          }`}
        />
      )}
      <div
        ref={sheetRef}
        className="relative h-full"
        style={{ visibility: active ? "hidden" : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
