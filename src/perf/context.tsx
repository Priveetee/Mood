"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  PerfMode,
  EffectivePerfMode,
  loadPerfMode,
  savePerfMode,
  computeEffectiveMode,
} from "./mode";

interface PerfContextValue {
  mode: PerfMode;
  effectiveMode: EffectivePerfMode;
  setMode: (_mode: PerfMode) => void;
}

const PerfContext = createContext<PerfContextValue | undefined>(undefined);

export function PerfModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<PerfMode>("auto");
  const [effectiveMode, setEffectiveMode] =
    useState<EffectivePerfMode>("normal");

  useEffect(() => {
    const initial = loadPerfMode();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeState(initial);
    setEffectiveMode(computeEffectiveMode(initial));
  }, []);

  const setMode = (next: PerfMode) => {
    setModeState(next);
    savePerfMode(next);
    setEffectiveMode(computeEffectiveMode(next));
  };

  return (
    <PerfContext.Provider value={{ mode, effectiveMode, setMode }}>
      {children}
    </PerfContext.Provider>
  );
}

export function usePerfMode() {
  const ctx = useContext(PerfContext);
  if (!ctx) {
    throw new Error("usePerfMode must be used within PerfModeProvider");
  }
  return ctx;
}
