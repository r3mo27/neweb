"use client";

import { motion } from "motion/react";
import { timeline } from "@/lib/data";
import { SectionFolder, SectionTitle } from "./SectionFolder";

const tilt = [-1.6, 1.1, -0.8, 1.5];

export function TrayectoriaSection() {
  return (
    <SectionFolder
      id="trayectoria"
      label="trayectoria"
      index={2}
      className="bg-navy"
    >
      <SectionTitle className="text-cream">Trayectoria</SectionTitle>

      <ol className="mt-10 grid flex-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {timeline.map((t, i) => (
          <motion.li
            key={t.title}
            initial={{ y: 70, opacity: 0, rotate: tilt[i] * 4 }}
            whileInView={{ y: 0, opacity: 1, rotate: tilt[i] }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: "spring", stiffness: 150, damping: 17, delay: i * 0.08 }}
          >
            {/* Hoja de papel suelta: rectangular, con su fecha arriba */}
            <motion.article
              whileHover={{ y: -10, rotate: 0, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="paper relative flex h-full min-h-[300px] flex-col rounded-[4px] p-6 shadow-[0_22px_40px_-18px_rgba(0,0,0,0.7)] sm:p-7"
            >
              <span className="mono text-[11px] text-ink/50">{t.when}</span>
              <h3 className="mt-4 text-[clamp(1.35rem,1.9vw,1.75rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink">
                {t.title}
              </h3>
              <p className="mono mt-2 text-[11px] text-blue">{t.where}</p>
              <p className="mt-4 text-[14px] leading-relaxed text-ink/75">{t.text}</p>
              <span className="display mt-auto pt-6 text-[clamp(3.5rem,5vw,4.8rem)] text-ink/10">
                0{i + 1}
              </span>
              {/* Esquina doblada */}
              <span
                aria-hidden
                className="absolute bottom-0 right-0 size-5 bg-gradient-to-tl from-navy/60 from-50% to-ink/10 to-50%"
              />
            </motion.article>
          </motion.li>
        ))}
      </ol>
    </SectionFolder>
  );
}
