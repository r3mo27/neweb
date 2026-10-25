"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSite } from "./Providers";

const MAJOR = 160;

/**
 * Fondo de plano técnico: cuadrícula con parallax suave, marcas de corte en las esquinas,
 * cota vertical con el alto real del cajón y un cajetín. Todo decorativo y fijo detrás.
 */
export function Blueprint() {
  const { t } = useSite();
  const { scrollY } = useScroll();
  // La cuadrícula baja más despacio que el contenido; con el módulo nunca se acaba.
  const gridY = useTransform(scrollY, (y) => -((y * 0.35) % MAJOR));
  const [folderH, setFolderH] = useState<number | null>(null);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>("main section");
      if (el) setFolderH(Math.round(el.offsetHeight));
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 600);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="blueprint-grid absolute inset-x-0 -top-[160px] h-[calc(100%+320px)]"
        style={{ y: gridY }}
      />

      {/* Marcas de corte */}
      <span className="crop left-5 top-5 border-l border-t" />
      <span className="crop right-5 top-5 border-r border-t" />
      <span className="crop bottom-5 left-5 border-b border-l" />
      <span className="crop bottom-5 right-5 border-b border-r" />

      {/* Cota vertical: alto del cajón */}
      <div className="absolute bottom-[14%] left-[22px] top-[18%] hidden w-px bg-cream/35 lg:block">
        <span className="absolute -left-[3px] top-0 h-px w-[7px] bg-cream/50" />
        <span className="absolute -left-[3px] bottom-0 h-px w-[7px] bg-cream/50" />
        <span className="mono absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap bg-blue px-2 text-[10px] text-cream/60">
          {t.blueprint.height} · {folderH ?? "—"}
        </span>
      </div>

      {/* Cajetín */}
      <div className="mono absolute bottom-9 right-9 hidden border border-cream/30 text-[10px] text-cream/60 lg:block">
        <div className="flex border-b border-cream/30">
          <span className="border-r border-cream/30 px-3 py-1.5">rem0</span>
          <span className="px-3 py-1.5">portfolio</span>
        </div>
        <div className="flex">
          <span className="border-r border-cream/30 px-3 py-1.5">R. Remacha</span>
          <span className="px-3 py-1.5">ZGZ · 2026</span>
        </div>
      </div>
    </div>
  );
}

/** Cota horizontal con el ancho real de lo que tiene debajo, como en un plano. */
export function WidthDimension() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setW(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="relative mt-4 hidden h-3 items-center sm:flex">
      <span className="h-3 w-px bg-cream/40" />
      <span className="h-px flex-1 bg-cream/35" />
      <span className="mono px-3 text-[10px] text-cream/60">{w ?? "—"} px</span>
      <span className="h-px flex-1 bg-cream/35" />
      <span className="h-3 w-px bg-cream/40" />
    </div>
  );
}
