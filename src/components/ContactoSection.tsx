"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { contact } from "@/lib/data";
import { SectionFolder, SectionTitle } from "./SectionFolder";

const spring = { type: "spring", stiffness: 240, damping: 20 } as const;

export function ContactoSection() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  }

  return (
    <SectionFolder
      id="contacto"
      label="contacto"
      index={4}
      last
      className="bg-ink !pb-8"
    >
      <div className="flex flex-1 flex-col justify-center">
        <div className="grid items-end gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionTitle className="max-w-[12ch] text-cream">
              Cuéntame qué tienes en mente.
            </SectionTitle>
            <p className="mt-7 max-w-[420px] text-[16px] leading-relaxed text-cream/75">
              Una web para tu proyecto, alguien para tu equipo backend o un compañero para el
              próximo hackatón.
            </p>
          </div>

          <motion.a
            href={`mailto:${contact.email}`}
            initial="rest"
            animate="rest"
            whileHover="open"
            whileFocus="open"
            className="focus-ring group relative block pt-7 [perspective:900px]"
            aria-label={`Escríbeme a ${contact.email}`}
          >
            <span className="r-tab mono absolute left-0 top-0 h-[29px] bg-blue px-3 pt-1.5 text-[10px] text-cream">
              correo
            </span>
            <span
              className="r-sm relative block h-[clamp(240px,32vh,310px)] bg-blue"
              style={{ borderTopLeftRadius: 0 }}
            >
              {/* La carta */}
              <motion.span
                variants={{ rest: { y: 0, rotate: -1 }, open: { y: -58, rotate: 1.5 } }}
                transition={spring}
                className="paper absolute inset-x-[5%] top-5 block h-[80%] rounded-[6px] px-6 pt-5 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.5)]"
              >
                <span className="mono block text-[9px] text-ink/50">Para: Rubén</span>
                <span className="mt-1 block text-[clamp(18px,2vw,26px)] font-extrabold tracking-[-0.03em] text-ink">
                  {contact.email}
                </span>
                <span className="mt-3 block h-1.5 w-4/5 rounded-full bg-ink/10" />
                <span className="mt-1.5 block h-1.5 w-3/5 rounded-full bg-ink/10" />
              </motion.span>
              {/* Frontal */}
              <motion.span
                variants={{ rest: { rotateX: 0 }, open: { rotateX: -20 } }}
                transition={spring}
                style={{ transformOrigin: "50% 100%" }}
                className="r-sm absolute inset-x-0 bottom-0 flex h-[56%] items-end bg-pink p-6 shadow-[0_-12px_26px_-12px_rgba(0,0,0,0.55)]"
              >
                <span className="text-[17px] font-bold text-ink">
                  Escríbeme{" "}
                  <motion.span
                    className="inline-block"
                    variants={{ rest: { x: 0 }, open: { x: 6 } }}
                    transition={spring}
                  >
                    →
                  </motion.span>
                </span>
              </motion.span>
            </span>
          </motion.a>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={copy}
            className="focus-ring mono relative h-7 overflow-hidden rounded-full border border-cream/25 px-3 text-[10px] text-cream/80 transition-colors hover:border-pink hover:text-pink"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "ok" : "copy"}
                className="block"
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {copied ? "copiado ✓" : "copiar correo"}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <footer className="mono flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 pt-5 text-[10px] text-cream/50">
        <span>
          © 2026 {contact.name} · {contact.city}
        </span>
        <span className="flex gap-5">
          <a
            href={contact.linkedin}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:text-pink hover:underline"
          >
            LinkedIn ↗
          </a>
          <a
            href={contact.github}
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:text-pink hover:underline"
          >
            GitHub ↗
          </a>
        </span>
      </footer>
    </SectionFolder>
  );
}
