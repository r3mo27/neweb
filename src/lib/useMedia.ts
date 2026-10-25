"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Táctil sin ratón: móviles y tablets. */
export const TOUCH = "(hover: none)";

/** Escritorio con ratón: donde los efectos ligados al scroll van fluidos. */
export const FANCY_SCROLL = "(min-width: 640px) and (hover: hover)";

export function useMedia(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
