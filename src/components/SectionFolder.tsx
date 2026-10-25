"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { SectionId } from "@/lib/data";
import { CoverShade, StackLayer } from "./StackLayer";
import { TabRow } from "./TabRow";

type Props = {
  id: SectionId;
  label: string;
  className: string;
  index: number;
  hold?: number;
  last?: boolean;
  children: ReactNode;
};

/** Una sección del cajón: sube y se encaja en la carpeta rem0, con su pestaña sobre la del índice. */
export function SectionFolder({ id, label, className, index, hold, last, children }: Props) {
  return (
    <StackLayer
      index={index}
      id={id}
      label={label}
      hold={hold}
      last={last}
      className="mx-auto w-full max-w-[1320px] px-4 sm:px-8"
    >
      <div className="relative">
        <TabRow only={id} />
        <div
          data-stack-body
          className={`r folder-shadow relative flex flex-col px-5 pb-10 pt-8 sm:min-h-[var(--folder-h)] sm:px-12 sm:pb-[clamp(1.5rem,5vh,3rem)] sm:pt-[clamp(1.5rem,5vh,3rem)] ${className}`}
        >
          {children}
          <CoverShade />
        </div>
      </div>
    </StackLayer>
  );
}

export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.h2
      initial={{ y: 40, opacity: 0, rotate: -2 }}
      whileInView={{ y: 0, opacity: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className={`display origin-bottom-left text-[clamp(3rem,min(9vw,14vh),7.6rem)] ${className}`}
    >
      {children}
    </motion.h2>
  );
}
