"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";

interface SilkContextType {
  setSilkColorAction: (_color: string) => void;
}

const SILK_COLOR_EVENT = "mood-admin-silk-color-change";

const SilkContext = createContext<SilkContextType | undefined>(undefined);

function parseSilkColorEvent(event: Event): string | null {
  if (
    !(event instanceof CustomEvent) ||
    typeof event.detail !== "object" ||
    event.detail === null
  ) {
    return null;
  }

  const color = (event.detail as { color?: unknown }).color;
  return typeof color === "string" ? color : null;
}

export function onSilkColorChange(handler: (_color: string) => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const listener = (event: Event) => {
    const color = parseSilkColorEvent(event);
    if (color) {
      handler(color);
    }
  };

  window.addEventListener(SILK_COLOR_EVENT, listener);
  return () => {
    window.removeEventListener(SILK_COLOR_EVENT, listener);
  };
}

export function SilkProvider({ children }: { children: ReactNode }) {
  const setSilkColorAction = useCallback((color: string) => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(new CustomEvent(SILK_COLOR_EVENT, { detail: { color } }));
  }, []);

  const value = useMemo(() => ({ setSilkColorAction }), [setSilkColorAction]);

  return <SilkContext.Provider value={value}>{children}</SilkContext.Provider>;
}

export function useSilk() {
  const context = useContext(SilkContext);
  if (context === undefined) {
    throw new Error("useSilk must be used within a SilkProvider");
  }
  return context;
}
