"use client";

import { motion, type Variants } from "motion/react";
import { useState } from "react";
import { contact, heroPapers } from "@/lib/data";
import { useSite } from "./Providers";
import { WidthDimension } from "./Blueprint";
import { CoverShade, StackLayer } from "./StackLayer";
import { TabRow } from "./TabRow";

const spring = { type: "spring", stiffness: 260, damping: 24, mass: 0.8 } as const;

const frontVariants: Variants = {
  closed: { rotateX: 0, y: 0 },
  open: { rotateX: -16, y: 4 },
};

const paperVariants: Variants = {
  closed: (i: number) => ({ y: 0, rotate: [-3, 1.5, -1.5][i], x: 0 }),
  open: (i: number) => ({
    y: [-34, -50, -30][i],
    rotate: [-6, 0.5, 5][i],
    x: [-14, 0, 14][i],
  }),
};

/**
 * La carpeta rem0: el índice del cajón. Enseña quién soy y sus pestañas son las de verdad;
 * al hacer scroll cada sección sube y se encaja dentro, con su pestaña encima de la suya.
 */
export function HeroFolder() {
  const { tweaks, scrollTo } = useSite();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* La barra de arriba no forma parte del cajón: se va con el scroll */}
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-5 sm:px-8">
        <div className="flex items-center justify-between">
          <p className="mono text-[11px] text-cream/90">
            {contact.name} · {contact.city}
          </p>
          <motion.button
            onClick={() => scrollTo("#contacto")}
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={spring}
            className="focus-ring rounded-full bg-cream px-4 py-2 text-xs font-semibold text-ink shadow-[0_2px_0_rgba(0,0,0,0.25)]"
          >
            Escríbeme
          </motion.button>
        </div>
        <WidthDimension />
      </div>

      <StackLayer
        index={0}
        rise={false}
        label="Inicio"
        className="mx-auto mt-6 w-full max-w-[1320px] px-4 sm:px-8"
      >
        <header style={{ perspective: 1400 }}>
          {/* Intro: la carpeta sube desde el cajón girando en 3D */}
          <motion.div
            initial={{ y: 220, rotateX: 38, scale: 0.86 }}
            animate={{ y: 0, rotateX: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 15, mass: 1.1, delay: 0.1 }}
            style={{ transformOrigin: "50% 100%" }}
            className="relative"
          >
            {/* Pestaña grande con el logo */}
            <div className="r-tab relative z-0 inline-block bg-navy px-5 pb-1 pt-3 sm:px-7 sm:pt-4">
              <Logo />
            </div>

            <motion.div
              className="relative -mt-px"
              onHoverStart={() => setOpen(true)}
              onHoverEnd={() => setOpen(false)}
              animate={open ? "open" : "closed"}
              initial="closed"
            >
              {/* Las pestañas de verdad: llevan a cada sección */}
              <TabRow />

              {/* Fondo de la carpeta: mismo hueco que ocuparán las secciones */}
              <div
                className="r relative h-[480px] bg-navy sm:h-[var(--folder-h)]"
                style={{ borderTopLeftRadius: 0, perspective: 1100 }}
              >
                {/* Papeles con mi info: asoman por detrás del frontal */}
                <motion.div
                  initial={{ y: 260 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.7 }}
                  className="absolute inset-x-[4%] bottom-[calc(min(46%,330px)-70px)] h-[min(46%,300px)]"
                >
                  <div className="grid h-full grid-cols-3 gap-[3%]">
                    {heroPapers.map((p, i) => (
                      <motion.div
                        key={p.t}
                        custom={i}
                        variants={paperVariants}
                        transition={{ ...spring, delay: i * 0.035 }}
                        className="paper r-sm relative h-full origin-bottom px-3 pt-4 shadow-[0_-6px_18px_-8px_rgba(0,0,0,0.35)] sm:px-6 sm:pt-6"
                      >
                        <span className="mono block text-[10px] text-ink/50 sm:text-[11px]">
                          {p.n}
                        </span>
                        <span className="display mt-2 block text-[clamp(1.7rem,4.6vw,4.4rem)] text-ink">
                          {p.t}
                        </span>
                        <span className="mt-2 block text-[11px] leading-snug text-ink/60 sm:mt-3 sm:text-[14px]">
                          {p.d}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Frontal: en la intro se cierra desde tumbado, como una tapa */}
                <motion.div
                  initial={{ rotateX: -96 }}
                  animate={{ rotateX: 0 }}
                  transition={{ type: "spring", stiffness: 90, damping: 11, delay: 0.95 }}
                  style={{ transformOrigin: "50% 100%", perspective: 1100 }}
                  className="absolute inset-x-0 bottom-0 z-10 h-[min(46%,330px)] min-h-[200px]"
                >
                  <motion.div
                    variants={frontVariants}
                    transition={spring}
                    style={{ transformOrigin: "50% 100%" }}
                    className="r relative flex h-full flex-col justify-end gap-4 bg-pink p-5 shadow-[0_-12px_30px_-14px_rgba(0,0,0,0.45)] sm:flex-row sm:items-end sm:justify-between sm:p-9"
                  >
                    <h1 className="display max-w-[20ch] text-[clamp(2.2rem,5.8vw,5rem)] text-ink">
                      {tweaks.motto}
                    </h1>
                    <div className="max-w-[300px] shrink-0 text-[13px] leading-relaxed text-ink/80 sm:text-[14px]">
                      <p>
                        Webs a medida y backend en Java. Pulsa una pestaña o baja: cada sección es
                        una carpeta de este cajón.
                      </p>
                      <motion.button
                        onClick={() => scrollTo("#webs")}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.96 }}
                        className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-cream"
                      >
                        Abrir el cajón
                        <motion.span
                          animate={{ y: [0, 3, 0] }}
                          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                        >
                          ↓
                        </motion.span>
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
                <CoverShade />
              </div>
            </motion.div>
          </motion.div>
        </header>
      </StackLayer>
    </>
  );
}

function Logo() {
  return (
    <span className="display block select-none text-[clamp(4rem,10vw,6.4rem)] leading-[0.95] text-cream">
      rem
      <motion.span
        className="inline-block text-pink"
        whileHover={{ rotate: 18, scale: 1.08 }}
        transition={spring}
      >
        0
      </motion.span>
    </span>
  );
}
