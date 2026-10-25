"use client";

import { motion, useReducedMotion, type Transition } from "motion/react";
import { Fragment, useState, type ReactNode } from "react";
import { FANCY_SCROLL, useMedia } from "@/lib/useMedia";

/*
 * Entradas al hacer scroll, al estilo iOS: un muelle sin rebote, subida corta, fundido y un
 * desenfoque que se aclara. Los textos entran palabra por palabra.
 *
 * Al acabar se quita el filtro (`filter: none`): uno que se queda puesto, aunque sea
 * blur(0px), crea un contexto de apilamiento y las carpetas abiertas no podrían pasar por
 * encima de sus vecinas.
 */
export const revealSpring: Transition = { type: "spring", stiffness: 140, damping: 22, mass: 0.9 };

const tags = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  footer: motion.footer,
} as const;
type Tag = keyof typeof tags;

/** Cuánto dura como mucho la cascada de palabras de un texto, para que los largos no se eternicen. */
const MAX_CASCADE = 0.7;

function useHidden(y: number | string) {
  const reduce = useReducedMotion();
  // En táctil sin desenfoque: el filtro se repinta en cada frame y ahí tironea.
  const blur = useMedia(FANCY_SCROLL) && !reduce;
  return { opacity: 0, y, filter: blur ? "blur(8px)" : "blur(0px)" };
}

const shown = {
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
  transitionEnd: { filter: "none" },
};

type WordsProps = {
  text: string;
  as?: Tag;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Qué parte del texto tiene que verse para que empiece. */
  amount?: number;
};

/**
 * Texto que entra palabra por palabra cuando aparece en pantalla. Si luego cambia (idioma,
 * lema) vuelve a entrar, ya sin el retraso de la primera vez.
 */
export function Words({ text, as = "p", className, delay = 0, stagger = 0.045, amount = 0.5 }: WordsProps) {
  const Tag = tags[as];
  const hidden = useHidden("0.4em");
  const words = text.split(/\s+/).filter(Boolean);
  const step = Math.min(stagger, MAX_CASCADE / Math.max(1, words.length));
  const [firstText] = useState(text);

  return (
    <Tag
      key={text}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: step, delayChildren: text === firstText ? delay : 0 },
        },
      }}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          <motion.span
            className="inline-block"
            variants={{ hidden, show: { ...shown, transition: revealSpring } }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}

type RevealProps = {
  as?: Tag;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
  children: ReactNode;
};

/** Un bloque que sube y se enfoca al aparecer en pantalla. */
export function Reveal({ as = "div", className, delay = 0, y = 28, amount = 0.3, children }: RevealProps) {
  const Tag = tags[as];
  const hidden = useHidden(y);
  return (
    <Tag
      className={className}
      initial={hidden}
      whileInView={shown}
      viewport={{ once: true, amount }}
      transition={{ ...revealSpring, delay }}
    >
      {children}
    </Tag>
  );
}
