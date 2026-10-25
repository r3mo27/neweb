"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useSyncExternalStore } from "react";
import { defaultTweaks, useSite, type Shape, type Tweaks } from "./Providers";

const colorLabels: [keyof Tweaks["colors"], string][] = [
  ["blue", "Fondo"],
  ["navy", "Carpeta"],
  ["pink", "Acento"],
  ["cream", "Papel"],
  ["ink", "Tinta"],
];

const shapes: Shape[] = ["redonda", "recta", "blanda"];

const noop = () => () => {};

/** El panel es una herramienta de diseño: en producción solo aparece con `?tweaks` en la URL. */
function useTweaksEnabled() {
  return useSyncExternalStore(
    noop,
    () =>
      process.env.NODE_ENV !== "production" ||
      new URLSearchParams(window.location.search).has("tweaks"),
    () => false,
  );
}

export function TweaksPanel() {
  const enabled = useTweaksEnabled();
  return enabled ? <Panel /> : null;
}

function Panel() {
  const { tweaks, setTweaks, t } = useSite();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            data-lenis-prevent
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{ transformOrigin: "100% 100%" }}
            className="r-sm w-[290px] bg-cream p-4 text-ink shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)]"
          >
            <p className="mono mb-3 text-[10px] text-ink/50">tweaks</p>

            <label className="block text-[11px] font-semibold">
              Lema
              <textarea
                value={tweaks.motto}
                placeholder={t.hero.motto}
                onChange={(e) => setTweaks({ ...tweaks, motto: e.target.value })}
                rows={2}
                className="mt-1 w-full resize-none rounded-md border border-ink/15 bg-white/70 px-2 py-1.5 text-[13px] font-normal outline-none focus:border-blue"
              />
            </label>

            <p className="mt-3 text-[11px] font-semibold">Forma</p>
            <div className="mt-1 flex rounded-md bg-ink/5 p-0.5">
              {shapes.map((s) => (
                <button
                  key={s}
                  onClick={() => setTweaks({ ...tweaks, shape: s })}
                  className="relative flex-1 rounded py-1 text-[11px] capitalize"
                >
                  {tweaks.shape === s && (
                    <motion.span
                      layoutId="shape-pill"
                      className="absolute inset-0 rounded bg-ink"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative ${tweaks.shape === s ? "text-cream" : ""}`}>{s}</span>
                </button>
              ))}
            </div>

            <p className="mt-3 text-[11px] font-semibold">Colores</p>
            <div className="mt-1 grid grid-cols-5 gap-2">
              {colorLabels.map(([key, label]) => (
                <label key={key} className="flex flex-col items-center gap-1 text-[9px] text-ink/60">
                  <span className="relative size-9 overflow-hidden rounded-full border border-ink/15 shadow-inner">
                    <input
                      type="color"
                      value={tweaks.colors[key]}
                      onChange={(e) =>
                        setTweaks({ ...tweaks, colors: { ...tweaks.colors, [key]: e.target.value } })
                      }
                      className="absolute -inset-2 size-[calc(100%+16px)] cursor-pointer"
                      aria-label={`Color ${label}`}
                    />
                  </span>
                  {label}
                </label>
              ))}
            </div>

            <button
              onClick={() => setTweaks(defaultTweaks)}
              className="mono mt-4 text-[10px] text-ink/50 underline-offset-4 hover:text-ink hover:underline"
            >
              restablecer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-expanded={open}
        className="focus-ring mono rounded-full bg-ink px-4 py-2 text-[11px] text-cream shadow-lg"
      >
        {open ? "cerrar ×" : "tweaks ✦"}
      </motion.button>
    </div>
  );
}
