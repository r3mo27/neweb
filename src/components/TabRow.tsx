"use client";

import { sections, type SectionId } from "@/lib/data";
import { useSite } from "./Providers";

/** Color de la pestaña de cada carpeta, igual que su cuerpo. */
export const tabColors: Record<SectionId, string> = {
  webs: "paper text-ink",
  trayectoria: "bg-navy text-cream",
  premios: "bg-pink text-ink",
  contacto: "bg-ink text-cream",
};

/**
 * La fila de pestañas del cajón. El índice (rem0) y cada sección pintan exactamente la misma
 * fila, así que la pestaña de una sección cae justo encima de la suya en el índice. El cajón
 * la encuentra por `data-stack-nav` para alinear todas las capas con ella.
 *
 * `only`: en una sección solo se ve su pestaña; las demás ocupan su sitio, invisibles.
 */
export function TabRow({ only }: { only?: SectionId }) {
  const { scrollTo } = useSite();
  return (
    <nav
      data-stack-nav
      aria-label={only ? undefined : "Secciones"}
      aria-hidden={only ? true : undefined}
      // En una sección la fila no debe tapar las pestañas de las carpetas de atrás: solo su
      // propia pestaña recibe clics.
      className={`relative z-20 mb-[-1px] flex flex-wrap gap-1.5 sm:absolute sm:-top-[34px] sm:left-[clamp(200px,24vw,262px)] sm:mb-0 ${
        only ? "pointer-events-none" : ""
      }`}
    >
      {sections.map((s) => {
        const mine = only === s.id;
        const hidden = only && !mine;
        return (
          <button
            key={s.id}
            onClick={() => scrollTo(`#${s.id}`)}
            tabIndex={only ? -1 : undefined}
            className={`focus-ring r-tab mono relative h-[34px] px-2.5 text-[11px] transition-colors duration-300 sm:px-4 ${
              hidden ? "invisible" : "pointer-events-auto"
            } ${mine ? tabColors[s.id] : "bg-navy text-cream hover:text-pink"}`}
          >
            <span className="max-sm:hidden">{s.n} · </span>
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
