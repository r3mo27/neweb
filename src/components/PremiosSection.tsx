"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { awards, type Award } from "@/lib/data";
import { useMedia } from "@/lib/useMedia";
import Folder, { type FolderEntry } from "./Folder";
import { useSite } from "./Providers";
import { SectionFolder, SectionTitle } from "./SectionFolder";

const spring = { type: "spring", stiffness: 260, damping: 22 } as const;
const noop = () => () => {};
export function PremiosSection() {
  const { t } = useSite();
  const [open, setOpen] = useState<{ award: Award; photo: number } | null>(null);
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  return (
    <SectionFolder
      id="premios"
      label={t.sections.premios}
      index={3}
      className="bg-pink"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <SectionTitle className="text-ink">{t.premios.title}</SectionTitle>
        <p className="mono inline-flex w-fit -rotate-2 items-center gap-2 self-start rounded-full bg-ink px-4 py-2 text-[12px] uppercase tracking-[0.12em] text-pink lg:mt-5">
          <span className="animate-bounce">↓</span>
          {t.premios.intro}
        </p>
      </div>

      <div className="mt-14 grid flex-1 content-center sm:mt-[clamp(1.25rem,5vh,3.5rem)] gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ y: 70, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ ...spring, delay: i * 0.09 }}
          >
            <AwardFolder award={a} onOpen={(photo) => setOpen({ award: a, photo })} />
            <h3 className="mt-5 text-[clamp(1.1rem,1.5vw,1.35rem)] font-extrabold leading-snug tracking-[-0.02em] text-ink">
              {t.premios.awards[a.id].title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink/70">
              {t.premios.awards[a.id].text}
            </p>
          </motion.div>
        ))}
      </div>

      {/* En el body: dentro de la carpeta el clip-path y los transforms del cajón la recortarían */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <Gallery award={open.award} start={open.photo} onClose={() => setOpen(null)} />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </SectionFolder>
  );
}

/** Carpeta de React Bits con dos fotos y el diploma. Al pulsar un papel se abre la galería. */
function AwardFolder({ award, onOpen }: { award: Award; onOpen: (photo: number) => void }) {
  const { t } = useSite();
  const text = t.premios.awards[award.id];
  const [isOpen, setIsOpen] = useState(false);
  // En pantallas bajas las carpetas encogen para que el cajón quepa entero, con sus pestañas.
  const short = useMedia("(max-height: 760px)");
  const items: FolderEntry[] = [
    { image: award.photos[0], alt: t.premios.photoOf(text.title, 1) },
    { image: award.photos[1], alt: t.premios.photoOf(text.title, 2) },
    { content: <Diploma label={t.premios.diploma} text={text.diploma} /> },
  ];

  return (
    // Abierta, sus papeles se salen de la columna: tiene que quedar por encima de las vecinas.
    <div className={`relative flex flex-col items-center ${isOpen ? "z-20" : "z-0"}`}>
      <Folder
        label={award.tab}
        items={items}
        color="#1a24a6"
        paperColor="#f2efe6"
        tabPosition="left"
        size={short ? 1.05 : 1.3}
        open={isOpen}
        onOpenChange={setIsOpen}
        zoomOnClick={false}
        onItemClick={(_, index) => onOpen(index < 2 ? index : 0)}
      />
      <p className="mono mt-3 w-full text-center text-[11px] text-ink/60">{text.date}</p>
    </div>
  );
}

function Diploma({ label, text }: { label: string; text: string }) {
  return (
    <div className="paper flex h-full flex-col items-center px-3 pt-5 text-center">
      <span className="mono text-[8px] tracking-[0.2em] text-ink/50">{label}</span>
      <span className="mt-2 text-[15px] font-extrabold leading-tight text-ink">{text}</span>
      <span className="mt-2 block h-px w-3/4 bg-ink/20" />
      <span className="mt-1 block h-px w-1/2 bg-ink/20" />
      <span className="mt-auto mb-3 grid size-6 place-items-center rounded-full border-2 border-pink text-[9px] text-pink">
        ★
      </span>
    </div>
  );
}

function Gallery({
  award,
  start,
  onClose,
}: {
  award: Award;
  start: number;
  onClose: () => void;
}) {
  const { t } = useSite();
  const title = t.premios.awards[award.id].title;
  const [i, setI] = useState(start);
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

  const go = (step: number) => setI((x) => (x + step + n) % n);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-lenis-prevent
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-ink/85 px-4 pt-14 pb-5 backdrop-blur-md sm:px-20 sm:pt-16 sm:pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label={t.premios.close}
        className="focus-ring absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-cream text-[18px] leading-none text-ink transition-transform hover:scale-105 sm:top-5 sm:right-5"
      >
        ×
      </button>

      {/* La foto entera, con su proporción, ajustada a la pantalla */}
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={award.photos[i]}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            drag={n > 1 ? "x" : false}
            dragSnapToOrigin
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 80) go(info.offset.x < 0 ? 1 : -1);
            }}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing"
          >
            <Image
              src={award.photos[i]}
              alt={t.premios.photoOf(title, i + 1)}
              width={1600}
              height={1200}
              sizes="(max-width: 768px) 100vw, 1200px"
              className="pointer-events-none block h-auto max-h-[calc(100svh-180px)] w-auto max-w-full select-none rounded-[14px] shadow-[0_30px_80px_-24px_rgba(0,0,0,0.85)]"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {n > 1 && (
        <>
          <GalleryArrow side="left" label={t.premios.prev} onClick={() => go(-1)} />
          <GalleryArrow side="right" label={t.premios.next} onClick={() => go(1)} />
        </>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-3"
      >
        <span className="mono rounded-full bg-pink px-3 py-1.5 text-[11px] text-ink">
          {award.tab} · {i + 1}/{n}
        </span>
        <span className="text-[14px] font-semibold text-cream">{title}</span>
        <div className="flex gap-2">
          {award.photos.map((p, k) => (
            <button
              key={p}
              onClick={() => setI(k)}
              aria-label={t.premios.photo(k + 1)}
              aria-current={k === i}
              className={`focus-ring relative h-10 w-14 overflow-hidden rounded-md transition-all duration-300 ${
                k === i ? "ring-2 ring-pink" : "opacity-45 hover:opacity-90"
              }`}
            >
              <Image src={p} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function GalleryArrow({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      className={`focus-ring absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-[18px] text-ink transition-transform hover:scale-105 sm:grid ${
        side === "left" ? "left-5" : "right-5"
      }`}
    >
      {side === "left" ? "←" : "→"}
    </button>
  );
}
