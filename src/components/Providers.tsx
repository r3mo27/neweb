"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { copy, defaultLang, langs, type Copy, type Lang } from "@/lib/i18n";
import { TOUCH } from "@/lib/useMedia";

export type Shape = "redonda" | "recta" | "blanda";

export type Tweaks = {
  motto: string;
  shape: Shape;
  colors: { blue: string; navy: string; pink: string; cream: string; ink: string };
};

/** Vacío = el lema traducido del idioma activo. */
export const defaultTweaks: Tweaks = {
  motto: "",
  shape: "redonda",
  colors: {
    blue: "#2536d8",
    navy: "#1a24a6",
    pink: "#f9b6d0",
    cream: "#f2efe6",
    ink: "#11142e",
  },
};

const radii: Record<Shape, [string, string]> = {
  redonda: ["22px", "12px"],
  recta: ["4px", "3px"],
  blanda: ["38px", "20px"],
};

type Ctx = {
  tweaks: Tweaks;
  setTweaks: (t: Tweaks) => void;
  scrollTo: (target: string) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Copy;
};

const SiteContext = createContext<Ctx | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite fuera de <Providers>");
  return ctx;
}

/** El lema que ve el usuario: uno personalizado gana; los de serie siguen al idioma. */
export function useMotto() {
  const { tweaks, t } = useSite();
  const stock = !tweaks.motto || langs.some((l) => copy[l].hero.motto === tweaks.motto);
  return stock ? t.hero.motto : tweaks.motto;
}

const STORAGE_KEY = "rem0-tweaks";
const LANG_KEY = "rem0-lang";

export function Providers({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [tweaks, setTweaksState] = useState<Tweaks>(defaultTweaks);
  const [lang, setLangState] = useState<Lang>(defaultLang);

  useEffect(() => {
    // Se lee tras montar para que el HTML del servidor y el primer render coincidan.
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setTweaksState({ ...defaultTweaks, ...JSON.parse(saved) });
      const savedLang = localStorage.getItem(LANG_KEY);
      if (langs.includes(savedLang as Lang)) setLangState(savedLang as Lang);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
  }, []);

  const setTweaks = useCallback((t: Tweaks) => {
    setTweaksState(t);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement.style;
    const { colors, shape } = tweaks;
    root.setProperty("--c-blue", colors.blue);
    root.setProperty("--c-navy", colors.navy);
    root.setProperty("--c-pink", colors.pink);
    root.setProperty("--c-cream", colors.cream);
    root.setProperty("--c-ink", colors.ink);
    root.setProperty("--radius", radii[shape][0]);
    root.setProperty("--radius-sm", radii[shape][1]);
  }, [tweaks]);

  useEffect(() => {
    // Al recargar, el navegador restauraría el scroll antes de que el cajón esté medido y se
    // verían las carpetas descolocadas un instante: empezamos siempre desde arriba.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // En táctil Lenis no suaviza nada (el dedo usa el scroll nativo) y solo añadiría trabajo por frame.
    if (window.matchMedia(TOUCH).matches) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: string) => {
    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;
    // Las anclas del cajón saben a qué altura de scroll su carpeta queda ya colocada.
    const stuckAt = Number(el.dataset.stuckAt);
    const y =
      Number.isFinite(stuckAt) && el.dataset.stuckAt
        ? stuckAt
        : el.getBoundingClientRect().top + window.scrollY - 60;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  return (
    <SiteContext.Provider value={{ tweaks, setTweaks, scrollTo, lang, setLang, t: copy[lang] }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </SiteContext.Provider>
  );
}
