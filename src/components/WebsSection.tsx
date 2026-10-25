"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { projects, type Project } from "@/lib/data";
import CardSwap, { Card, type CardSwapHandle } from "./CardSwap";
import { useSite } from "./Providers";
import { Reveal, Words } from "./Reveal";
import { SectionFolder, SectionTitle } from "./SectionFolder";

const spring = { type: "spring", stiffness: 210, damping: 26, mass: 0.9 } as const;

export function WebsSection() {
  const [active, setActive] = useState(0);
  const swapRef = useRef<CardSwapHandle>(null);
  const { t } = useSite();
  const project = projects[active];
  const text = t.webs.projects[project.id];

  const pick = (i: number) => {
    setActive(i);
    swapRef.current?.goTo(i);
  };

  return (
    <SectionFolder id="webs" label={t.sections.webs} index={1} className="paper">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <SectionTitle className="text-ink">{t.webs.title}</SectionTitle>
        <Reveal delay={0.2} y={16}>
          <div role="tablist" aria-label={t.webs.tabs} className="flex flex-wrap gap-1.5 lg:mt-3">
            {projects.map((p, i) => (
              <button
                key={p.id}
                role="tab"
                aria-selected={i === active}
                onClick={() => pick(i)}
                className="focus-ring relative rounded-md px-3 py-1.5 text-[11px] font-semibold text-ink/80 transition-colors hover:text-ink"
              >
                {i === active && (
                  <motion.span
                    layoutId="web-tab"
                    className="absolute inset-0 rounded-md bg-blue"
                    transition={spring}
                  />
                )}
                <span
                  className={`relative transition-colors duration-300 ${i === active ? "text-cream" : ""}`}
                >
                  0{i + 1} · {p.name}
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="mt-6 grid flex-1 items-center gap-12 lg:mt-2 lg:grid-cols-[1.45fr_1fr]">
        <Reveal
          delay={0.1}
          y={48}
          className="relative mx-auto h-[min(52vw,420px)] w-full max-w-[780px] sm:h-[clamp(280px,58vh,460px)]"
        >
          <CardSwap
            ref={swapRef}
            width={640}
            height={430}
            cardDistance={48}
            verticalDistance={56}
            depth={80}
            skewAmount={4}
            visibleCards={4}
            cardRadius={14}
            delay={4200}
            speed={1}
            bounce={0.35}
            parallax={0.45}
            hoverSpread={0.1}
            dim={0.45}
            autoplay
            pauseOnHover
            draggable
            theme="light"
            onChange={setActive}
            onCardClick={setActive}
          >
            {projects.map((p) => (
              <Card key={p.id} style={{ background: "transparent", boxShadow: "none" }}>
                <BrowserWindow project={p} />
              </Card>
            ))}
          </CardSwap>
        </Reveal>

        <div className="min-h-[230px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <Words text={text.kind} className="mono text-[10px] text-blue" />
              <Words
                as="h3"
                text={project.name}
                delay={0.05}
                stagger={0.08}
                className="mt-2 text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold leading-none tracking-[-0.04em] text-ink"
              />
              <Words
                text={text.lead}
                delay={0.15}
                className="mt-5 text-[16px] leading-relaxed text-ink/85"
              />
              <Words
                text={text.detail}
                delay={0.3}
                className="mt-3 text-[14px] leading-relaxed text-ink/60"
              />
              {project.url ? (
                <motion.a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="focus-ring mt-5 inline-flex items-center gap-1 rounded-full bg-blue px-4 py-2 text-[12px] font-semibold text-cream"
                >
                  {t.webs.visit(project.host)}
                </motion.a>
              ) : (
                <p className="mono mt-5 inline-block rounded-full border border-ink/20 px-4 py-2 text-[11px] text-ink/60">
                  {t.webs.private}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
          <Words text={t.webs.hint} delay={0.4} className="mono mt-8 text-[10px] text-ink/40 max-lg:hidden" />
        </div>
      </div>
    </SectionFolder>
  );
}

function BrowserWindow({ project }: { project: Project }) {
  const { t } = useSite();
  return (
    <div className="r-sm flex h-full w-full flex-col overflow-hidden border border-ink/15 bg-[#e6e3da]">
      <div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-ink/10 px-3">
        <span className="size-2 rounded-full bg-ink/20" />
        <span className="size-2 rounded-full bg-ink/20" />
        <span className="size-2 rounded-full bg-ink/20" />
        <span className="mono ml-2 truncate rounded bg-cream px-2 py-0.5 text-[9px] text-ink/60">
          {project.host}
        </span>
      </div>
      <div className="relative flex-1 select-none bg-white">
        {project.image ? (
          <Image
            src={project.image}
            alt={t.webs.screenshot(project.name)}
            fill
            sizes="(max-width: 1024px) 92vw, 640px"
            className="pointer-events-none object-cover object-top"
            draggable={false}
          />
        ) : (
          <KokodaMock />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: project.accent }} />
      </div>
    </div>
  );
}

/** Kokoda sin captura pública: mini interfaz de rankings. */
function KokodaMock() {
  const { t } = useSite();
  const rows = [
    ["1", "Rocolo_27", "S", 48],
    ["2", "Nebula", "A", 41],
    ["3", "Karakuri", "A", 37],
    ["4", "M1ST", "B", 30],
    ["5", "Ozzy", "B", 26],
  ] as const;
  return (
    <div className="absolute inset-0 flex flex-col bg-[#120d24] p-[5%] text-white">
      <div className="flex items-center justify-between">
        <span className="text-[clamp(10px,2vw,16px)] font-black tracking-tight">
          KOKODA <span className="text-[#a78bfa]">AWAKENED</span>
        </span>
        <span className="mono rounded-full bg-[#7c3aed] px-2 py-0.5 text-[clamp(6px,1.1vw,9px)]">
          {t.webs.season}
        </span>
      </div>
      <div className="mt-[4%] grid flex-1 grid-cols-[1.4fr_1fr] gap-[4%]">
        <div className="flex flex-col gap-[5%]">
          {rows.map(([pos, name, tier, wins]) => (
            <div
              key={name}
              className="flex flex-1 items-center gap-2 rounded-md bg-white/5 px-2 text-[clamp(7px,1.3vw,11px)]"
            >
              <span className="mono w-3 text-white/40">{pos}</span>
              <span className="flex-1 truncate font-semibold">{name}</span>
              <span className="rounded bg-[#a78bfa]/25 px-1.5 font-bold text-[#c4b5fd]">{tier}</span>
              <span className="mono text-white/60">{wins}W</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-center gap-[6%] rounded-md bg-white/5 p-[6%]">
          {[0, 1].map((g) => (
            <div key={g} className="flex flex-col gap-1">
              <div className="h-[clamp(8px,1.6vw,14px)] rounded bg-white/15" />
              <div className="h-[clamp(8px,1.6vw,14px)] rounded bg-[#7c3aed]/60" />
            </div>
          ))}
          <div className="mono text-center text-[clamp(6px,1vw,9px)] text-white/50">bracket · semis</div>
        </div>
      </div>
    </div>
  );
}
