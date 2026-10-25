"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { awards, type Award } from "@/lib/data";
import { SectionFolder, SectionTitle } from "./SectionFolder";

const spring = { type: "spring", stiffness: 260, damping: 22 } as const;

const front: Variants = {
  rest: { rotateX: 0 },
  open: { rotateX: -24 },
};
const photo: Variants = {
  rest: { y: 0, rotate: -5, x: 0 },
  open: { y: -44, rotate: -11, x: -18 },
};
const photo2: Variants = {
  rest: { y: 8, rotate: 2, x: 0 },
  open: { y: -30, rotate: 1, x: 6 },
};
const diploma: Variants = {
  rest: { y: 0, rotate: 4, x: 0 },
  open: { y: -50, rotate: 10, x: 22 },
};

export function PremiosSection() {
  const [open, setOpen] = useState<Award | null>(null);

  return (
    <SectionFolder
      id="premios"
      label="premios"
      index={3}
      className="bg-pink"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SectionTitle className="text-ink">Premios</SectionTitle>
        <p className="max-w-[340px] text-[15px] leading-relaxed text-ink/80 lg:mt-4">
          Con Cazadores de Rocolos, mi equipo. Cada carpeta lleva sus fotos dentro: pulsa para
          abrirla.
        </p>
      </div>

      <div className="mt-14 grid flex-1 content-center gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ y: 70, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ ...spring, delay: i * 0.09 }}
          >
            <MiniFolder award={a} onOpen={() => setOpen(a)} />
            <h3 className="mt-5 text-[clamp(1.1rem,1.5vw,1.35rem)] font-extrabold leading-snug tracking-[-0.02em] text-ink">
              {a.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/70">{a.text}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {open && <Gallery award={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </SectionFolder>
  );
}

function MiniFolder({ award, onOpen }: { award: Award; onOpen: () => void }) {
  return (
    <motion.button
      onClick={onOpen}
      initial="rest"
      animate="rest"
      whileHover="open"
      whileFocus="open"
      whileTap={{ scale: 0.97 }}
      aria-label={`Abrir fotos: ${award.title}`}
      className="focus-ring group relative block w-full cursor-pointer pt-7 text-left [perspective:900px]"
    >
      {/* Pestaña + fondo */}
      <span className="r-tab mono absolute left-0 top-0 h-[29px] bg-navy px-3 pt-1.5 text-[11px] text-cream">
        {award.tab}
      </span>
      <span className="r-sm relative block h-[clamp(200px,30vh,290px)] bg-navy" style={{ borderTopLeftRadius: 0 }}>
        {/* Papeles: fotos y diploma */}
        <motion.span
          variants={photo2}
          transition={spring}
          className="absolute left-[10%] top-4 block h-[74%] w-[40%] overflow-hidden rounded-[3px] bg-white p-1 shadow-md"
        >
          <span className="relative block h-full w-full">
            <Image src={award.photos[1]} alt="" fill sizes="200px" className="object-cover" />
          </span>
        </motion.span>
        <motion.span
          variants={photo}
          transition={spring}
          className="absolute left-[6%] top-3 block h-[74%] w-[42%] overflow-hidden rounded-[3px] bg-white p-1 shadow-md"
        >
          <span className="relative block h-full w-full">
            <Image src={award.photos[0]} alt="" fill sizes="200px" className="object-cover" />
          </span>
        </motion.span>
        <motion.span
          variants={diploma}
          transition={spring}
          className="paper absolute right-[7%] top-3 flex h-[76%] w-[44%] flex-col items-center rounded-[3px] border border-ink/10 px-3 pt-5 text-center shadow-md"
        >
          <span className="mono text-[8px] tracking-[0.2em] text-ink/50">DIPLOMA</span>
          <span className="mt-2 text-[clamp(13px,1.3vw,17px)] font-extrabold leading-tight text-ink">{award.diploma}</span>
          <span className="mt-2 block h-px w-3/4 bg-ink/20" />
          <span className="mt-1 block h-px w-1/2 bg-ink/20" />
          <span className="mt-auto mb-2 grid size-6 place-items-center rounded-full border-2 border-pink text-[9px] text-pink">
            ★
          </span>
        </motion.span>

        {/* Frontal */}
        <motion.span
          variants={front}
          transition={spring}
          style={{ transformOrigin: "50% 100%" }}
          className="r-sm absolute inset-x-0 bottom-0 flex h-[60%] items-end bg-blue p-4 shadow-[0_-10px_24px_-12px_rgba(0,0,0,0.5)]"
        >
          <span className="mono text-[12px] text-cream">{award.date}</span>
          <span className="mono ml-auto text-[12px] text-cream/70 transition-colors group-hover:text-pink">
            {award.photos.length} fotos ↗
          </span>
        </motion.span>
      </span>
    </motion.button>
  );
}

function Gallery({ award, onClose }: { award: Award; onClose: () => void }) {
  const [i, setI] = useState(0);
  const n = award.photos.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((x) => (x + 1) % n);
      if (e.key === "ArrowLeft") setI((x) => (x - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [n, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={award.title}
      data-lenis-prevent
      className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 80, scale: 0.92, rotate: -2 }}
        animate={{ y: 0, scale: 1, rotate: 0 }}
        exit={{ y: 60, scale: 0.95, opacity: 0 }}
        transition={spring}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[860px]"
      >
        <span className="r-tab mono inline-block bg-navy px-4 pt-2 pb-1.5 text-[11px] text-cream">
          {award.tab} · {i + 1}/{n}
        </span>
        <div className="r bg-navy p-3 sm:p-4" style={{ borderTopLeftRadius: 0 }}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-ink">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={award.photos[i]}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 80)
                    setI((x) => (x + (info.offset.x < 0 ? 1 : -1) + n) % n);
                }}
              >
                <Image
                  src={award.photos[i]}
                  alt={`${award.title}, foto ${i + 1}`}
                  fill
                  sizes="860px"
                  className="pointer-events-none object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {award.photos.map((p, k) => (
              <button
                key={p}
                onClick={() => setI(k)}
                aria-label={`Foto ${k + 1}`}
                className={`focus-ring relative h-12 w-16 overflow-hidden rounded-md transition-all duration-300 ${
                  k === i ? "ring-2 ring-pink" : "opacity-50 hover:opacity-90"
                }`}
              >
                <Image src={p} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
            <button
              onClick={onClose}
              className="focus-ring ml-auto rounded-full bg-cream px-4 py-2 text-[12px] font-semibold text-ink"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
