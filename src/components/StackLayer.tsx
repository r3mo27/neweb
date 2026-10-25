"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { FANCY_SCROLL, TOUCH, useMedia } from "@/lib/useMedia";

/* ------------------------------------------------------------------------------------------
 * El cajón. La capa 0 es la carpeta rem0 (el índice) y cada sección es una carpeta que sube
 * desde abajo y se encaja dentro de ella: todas se pegan de forma que su fila de pestañas
 * (`data-stack-nav`) cae exactamente sobre la del índice. Así la pestaña de cada sección tapa
 * la suya en el índice, y el logo y el resto de pestañas siguen asomando por encima.
 *
 * Un único controlador mide todas las capas, decide dónde se pega cada una y, en cada frame
 * de scroll, calcula cuánto tapa cada carpeta a la anterior y el giro de entrada.
 * ---------------------------------------------------------------------------------------- */

type Layer = {
  el: HTMLElement;
  anchor: HTMLElement;
  spacer: HTMLElement;
  last: boolean;
  hold: number;
  rise: boolean;
  top: MotionValue<number>;
  clip: MotionValue<number>;
  cover: MotionValue<number>;
  enter: MotionValue<number>;
  // Calculado en layout()
  layoutTop: number;
  sticky: number;
  h: number;
};

type StackCtx = { register: (i: number, layer: Layer | null) => void };

const StackContext = createContext<StackCtx | null>(null);
const CoverContext = createContext<MotionValue<number> | null>(null);

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** Distancia vertical de `el` al borde superior de `root`, sin contar transformaciones. */
function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let y = 0;
  let e: HTMLElement | null = el;
  while (e && e !== root) {
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  return e === root ? y : 0;
}

export function Stack({ children }: { children: ReactNode }) {
  const layers = useRef(new Map<number, Layer>());
  const viewport = useRef({ w: 0, h: 0 });

  // En táctil la barra de direcciones cambia el alto al hacer scroll: recolocar el cajón por eso
  // movería todo lo de debajo a mitad de gesto. Ahí el alto solo se renueva si cambia el ancho.
  const measureViewport = useCallback(() => {
    const w = window.innerWidth;
    const touch = window.matchMedia(TOUCH).matches;
    if (!touch || w !== viewport.current.w || !viewport.current.h) {
      viewport.current = { w, h: window.innerHeight };
    }
    return viewport.current.h;
  }, []);

  const update = useCallback(() => {
    const s = window.scrollY;
    const vh = viewport.current.h;
    if (!vh) return;
    const order = [...layers.current.keys()].sort((a, b) => b - a);
    let next: (Layer & { visual: number }) | null = null;
    for (const i of order) {
      const L = layers.current.get(i)!;
      const visual = Math.max(L.layoutTop - s, L.sticky);
      // Entrada: 0 cuando asoma por abajo, 1 cuando llega a su sitio.
      L.enter.set(clamp((vh - (L.layoutTop - s)) / Math.max(1, vh - L.sticky)));
      if (!next) {
        L.clip.set(0);
        L.cover.set(0);
      } else {
        const a = next.layoutTop - vh;
        const b = next.layoutTop - next.sticky;
        L.cover.set(clamp((s - a) / Math.max(1, b - a)));
        // Solo se recorta lo que sobresaldría por debajo de la de delante (si esta es más baja).
        const overhang = visual + L.h - (next.visual + next.h) + 30;
        L.clip.set(Math.max(0, Math.min(L.h, overhang)));
      }
      next = { ...L, visual };
    }
  }, []);

  const layout = useCallback(() => {
    const vh = measureViewport();
    const all = [...layers.current.entries()].sort((a, b) => a[0] - b[0]).map(([, l]) => l);
    if (!vh || !all.length) return;

    // Todas las carpetas miden lo mismo: si no, cada una se pegaría a una altura distinta y sus
    // pestañas no caerían en la misma fila. Manda la que más contenido tiene. En móvil no: ahí
    // las secciones son mucho más largas que la pantalla y cada una va a su aire.
    const bodies = all.map((l) => l.el.querySelector<HTMLElement>("[data-stack-body]"));
    if (window.matchMedia("(min-width: 640px)").matches) {
      bodies.forEach((b) => b && (b.style.minHeight = "0px"));
      const tallest = Math.max(...bodies.map((b) => b?.offsetHeight ?? 0));
      bodies.forEach((b) => b && (b.style.minHeight = `${tallest}px`));
    } else {
      bodies.forEach((b) => b && (b.style.minHeight = ""));
    }

    // Dónde está la fila de pestañas dentro de cada capa.
    const navOff = all.map((l) => {
      const nav = l.el.querySelector<HTMLElement>("[data-stack-nav]");
      return nav ? offsetWithin(nav, l.el) : 0;
    });
    const hs = all.map((l) => l.el.offsetHeight);

    // Altura del conjunto desde la fila de pestañas hacia abajo (la capa más alta manda)
    // más lo que asoma el índice por encima de su fila (el logo). Se centra en pantalla.
    const below = Math.max(...hs.map((h, i) => h - navOff[i]));
    const above = Math.max(0, navOff[0]);
    const indexTop = Math.max(16, Math.round((vh - (above + below)) / 2));
    const line = indexTop + navOff[0];

    all.forEach((l, i) => {
      const h = hs[i];
      let sticky = line - navOff[i];
      // Una carpeta más alta que la pantalla (móvil) se pega cuando asoma su parte de abajo.
      if (sticky + h > vh - 16) sticky = Math.min(sticky, vh - h - 16);
      l.sticky = sticky;
      l.h = h;
      l.top.set(sticky);
      // La última necesita sitio debajo para llegar a su sitio antes de que acabe la página.
      l.spacer.style.height = `${l.last ? Math.max(16, vh - h - sticky) : (l.hold * vh) / 100}px`;
    });

    // Con los huecos ya puestos, se mide dónde empieza cada capa en el documento.
    all.forEach((l) => {
      const margin = parseFloat(getComputedStyle(l.el).marginTop) || 0;
      l.layoutTop = l.anchor.getBoundingClientRect().top + window.scrollY + margin;
      // Dónde hay que hacer scroll para ver esta carpeta ya colocada.
      l.anchor.dataset.stuckAt = String(Math.max(0, Math.round(l.layoutTop - l.sticky)));
    });
    update();
  }, [update, measureViewport]);

  const register = useCallback(
    (i: number, layer: Layer | null) => {
      if (layer) layers.current.set(i, layer);
      else layers.current.delete(i);
      layout();
    },
    [layout],
  );

  useLayoutEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(layout);
    };
    const onResize = () => {
      const { w, h } = viewport.current;
      if (window.innerWidth === w && measureViewport() === h) return;
      schedule();
    };
    window.addEventListener("resize", onResize);
    // Las fuentes cambian el alto de los textos al cargar.
    document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [layout, measureViewport]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", update);

  return <StackContext.Provider value={{ register }}>{children}</StackContext.Provider>;
}

export function useCover() {
  return useContext(CoverContext);
}

type Props = {
  index: number;
  id?: string;
  label?: string;
  /** Scroll extra con la carpeta quieta antes de que suba la siguiente (en vh). */
  hold?: number;
  /** La última carpeta: al acabar la página se queda en su sitio, no pegada abajo. */
  last?: boolean;
  /** Giro 3D al entrar (el índice ya tiene su propia intro). */
  rise?: boolean;
  className?: string;
  children: ReactNode;
};

export function StackLayer({
  index,
  id,
  label,
  hold = 55,
  last = false,
  rise = true,
  className = "",
  children,
}: Props) {
  const stack = useContext(StackContext);
  const ref = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  const top = useMotionValue(16);
  const clip = useMotionValue(0);
  const cover = useMotionValue(0);
  const enter = useMotionValue(rise ? 0 : 1);

  useLayoutEffect(() => {
    const el = ref.current;
    const anchor = anchorRef.current;
    const spacer = spacerRef.current;
    if (!el || !anchor || !spacer || !stack) return;
    const layer: Layer = {
      el,
      anchor,
      spacer,
      last,
      hold,
      rise,
      top,
      clip,
      cover,
      enter,
      layoutTop: 0,
      sticky: 0,
      h: 0,
    };
    stack.register(index, layer);
    // Si cambia el alto de la carpeta, se recoloca todo el cajón.
    const ro = new ResizeObserver(() => stack.register(index, layer));
    ro.observe(el);
    return () => {
      ro.disconnect();
      stack.register(index, null);
    };
  }, [index, hold, last, rise, stack, top, clip, cover, enter]);

  // Clip con márgenes negativos arriba y a los lados para no cortar pestañas ni sombras.
  const clipPath = useTransform(clip, (c) => `inset(-200px -60px ${c}px -60px)`);
  const e = useTransform(enter, (v) => 1 - Math.pow(1 - v, 2.2));
  const rotateX = useTransform(e, [0, 1], [rise ? 28 : 0, 0]);
  const scale = useTransform(e, [0, 1], [rise ? 0.88 : 1, 1]);
  const lift = useTransform(e, [0, 1], [rise ? 60 : 0, 0]);
  // En móvil el scroll va por su cuenta y un giro calculado en cada frame llega tarde y tiembla:
  // las carpetas suben tal cual, solo con el sticky nativo.
  const fancy = useMedia(FANCY_SCROLL);

  return (
    <>
      {/* Ancla sin sticky: marca dónde empieza la capa para poder hacer scroll hasta ella */}
      <div ref={anchorRef} id={id} aria-hidden className="h-0" />
      <motion.section
        ref={ref}
        aria-label={label}
        className={`sticky ${className}`}
        style={{ top, zIndex: index, clipPath, perspective: 1600 }}
      >
        <motion.div
          style={
            fancy
              ? { rotateX, scale, y: lift, transformOrigin: "50% 100%" }
              : { rotateX: 0, scale: 1, y: 0 }
          }
        >
          <CoverContext.Provider value={cover}>{children}</CoverContext.Provider>
        </motion.div>
      </motion.section>
      {/* Tramo de pausa: la carpeta sigue pegada mientras se recorre. Desde el HTML del
          servidor ya ocupa su sitio, para que la siguiente no asome en el primer pintado. */}
      <div ref={spacerRef} aria-hidden style={{ height: last ? 16 : `${hold}vh` }} />
    </>
  );
}

/** Sombra que oscurece una carpeta mientras la tapan. Va dentro del cuerpo redondeado. */
export function CoverShade() {
  const fallback = useMotionValue(0);
  const cover = useCover() ?? fallback;
  const opacity = useTransform(cover, [0, 1], [0, 0.45]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] bg-[#05071a]"
      style={{ opacity }}
    />
  );
}
