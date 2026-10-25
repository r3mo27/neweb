"use client";

import { motion, Reorder, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { contact } from "@/lib/data";
import { langs } from "@/lib/i18n";
import { useMotto, useSite } from "./Providers";
import { WidthDimension } from "./Blueprint";
import { CoverShade, StackLayer } from "./StackLayer";
import { TabRow } from "./TabRow";

const spring = { type: "spring", stiffness: 260, damping: 24, mass: 0.8 } as const;

const frontVariants: Variants = {
  closed: { rotateX: 0, y: 0 },
  open: { rotateX: -16, y: 4 },
};

const paperPose = (i: number, open: boolean) =>
  open
    ? { y: [-34, -50, -30][i], rotate: [-6, 0.5, 5][i], x: [-14, 0, 14][i] }
    : { y: 0, rotate: [-3, 1.5, -1.5][i], x: 0 };

/**
 * La carpeta rem0: el índice del cajón. Enseña quién soy y sus pestañas son las de verdad;
 * al hacer scroll cada sección sube y se encaja dentro, con su pestaña encima de la suya.
 */
export function HeroFolder() {
  const { scrollTo, t } = useSite();
  const motto = useMotto();
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(() => t.hero.papers.map((p) => p.id));
  const [dragging, setDragging] = useState(false);
  const papersRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef(0);
  // Mientras se arrastra un papel (y mientras vuelve a su hueco) la carpeta deja de recortarse
  // y sube por encima de las demás, para que el papel se pueda pasear por toda la página.
  const [lifted, setLifted] = useState(false);
  useEffect(() => {
    papersRef.current?.closest("section")?.toggleAttribute("data-lifted", lifted);
  }, [lifted]);
  const startDrag = () => {
    window.clearTimeout(settleTimer.current);
    setDragging(true);
    setLifted(true);
  };
  const endDrag = () => {
    setDragging(false);
    settleTimer.current = window.setTimeout(() => setLifted(false), 650);
  };

  return (
    <>
      {/* La barra de arriba no forma parte del cajón: se va con el scroll */}
      <div className="mx-auto w-full max-w-[1320px] px-4 pt-5 sm:px-8">
        <div className="flex items-center justify-between">
          <p className="mono text-[11px] text-cream/90">
            {contact.name} · {contact.city}
          </p>
          <div className="flex items-center gap-2">
            <LangToggle />
            <motion.button
              onClick={() => scrollTo("#contacto")}
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              className="focus-ring rounded-full bg-cream px-4 py-2 text-xs font-semibold text-ink shadow-[0_2px_0_rgba(0,0,0,0.25)]"
            >
              {t.topbar.cta}
            </motion.button>
          </div>
        </div>
        <WidthDimension />
      </div>

      <StackLayer
        index={0}
        rise={false}
        label={t.hero.label}
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
              {/* Con un papel en la mano el cuerpo sube por encima de las pestañas (z-20) */}
              <div
                className={`r relative h-[480px] bg-navy sm:h-[var(--folder-h)] ${lifted ? "z-30" : ""}`}
                style={{ borderTopLeftRadius: 0, perspective: 1100 }}
              >
                {/* Papeles con mi info: asoman por detrás del frontal. Se pueden arrastrar para
                    cambiarlos de sitio; al soltarlos vuelven a su hueco. Este contenedor no puede
                    tener transform ni z-index: mientras se arrastra, el papel (z-index 1) pasa por
                    delante del frontal (z-index 0); al soltarlo, el frontal sube a 2 y lo tapa. */}
                <div
                  ref={papersRef}
                  className="absolute inset-x-[4%] bottom-[calc(min(46%,330px)-70px)] h-[min(46%,300px)]"
                >
                  <Reorder.Group
                    as="div"
                    axis="x"
                    values={order}
                    onReorder={setOrder}
                    className="grid h-full grid-cols-3 gap-[3%]"
                  >
                    {order.map((id, i) => {
                      const p = t.hero.papers.find((paper) => paper.id === id)!;
                      return (
                        <Reorder.Item
                          key={id}
                          value={id}
                          as="div"
                          drag
                          dragMomentum={false}
                          dragTransition={{ bounceStiffness: 600, bounceDamping: 38 }}
                          onDragStart={startDrag}
                          onDragEnd={endDrag}
                          whileDrag={{ scale: 1.05 }}
                          className="focus-ring h-full cursor-grab rounded-[var(--radius-sm)] active:cursor-grabbing"
                        >
                          <motion.div
                            initial={{ y: 260 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.7 }}
                            className="h-full"
                          >
                            <motion.div
                              initial={false}
                              animate={paperPose(i, open)}
                              transition={{ ...spring, delay: i * 0.035 }}
                              className="paper r-sm relative h-full origin-bottom select-none px-3 pt-4 shadow-[0_-6px_18px_-8px_rgba(0,0,0,0.35)] sm:px-6 sm:pt-6"
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
                          </motion.div>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>

                {/* Frontal: en la intro se cierra desde tumbado, como una tapa */}
                <motion.div
                  initial={{ rotateX: -96 }}
                  animate={{ rotateX: 0 }}
                  transition={{ type: "spring", stiffness: 90, damping: 11, delay: 0.95 }}
                  style={{ transformOrigin: "50% 100%", perspective: 1100 }}
                  className={`absolute inset-x-0 bottom-0 h-[min(46%,330px)] min-h-[200px] ${dragging ? "z-0" : "z-[2]"}`}
                >
                  <motion.div
                    variants={frontVariants}
                    transition={spring}
                    style={{ transformOrigin: "50% 100%" }}
                    className="r relative flex h-full flex-col justify-end gap-4 bg-pink p-5 shadow-[0_-12px_30px_-14px_rgba(0,0,0,0.45)] sm:flex-row sm:items-end sm:justify-between sm:p-9"
                  >
                    <h1 className="display max-w-[20ch] text-[clamp(2.2rem,5.8vw,5rem)] text-ink">
                      {motto}
                    </h1>
                    <div className="max-w-[300px] shrink-0 text-[13px] leading-relaxed text-ink/80 sm:text-[14px]">
                      <p>{t.hero.intro}</p>
                      <motion.button
                        onClick={() => scrollTo("#webs")}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.96 }}
                        className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-cream"
                      >
                        {t.hero.open}
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

function LangToggle() {
  const { lang, setLang, t } = useSite();
  return (
    <div
      role="group"
      aria-label={t.topbar.language}
      className="mono flex rounded-full bg-ink/30 p-0.5 text-[11px]"
    >
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className="focus-ring relative rounded-full px-2.5 py-1.5 uppercase"
        >
          {lang === l && (
            <motion.span
              layoutId="lang-pill"
              className="absolute inset-0 rounded-full bg-cream"
              transition={spring}
            />
          )}
          <span className={`relative ${lang === l ? "text-ink" : "text-cream/80"}`}>{l}</span>
        </button>
      ))}
    </div>
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
