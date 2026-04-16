"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  computeEffectiveMode,
  type EffectivePerfMode,
  loadPerfMode,
  type PerfMode,
  savePerfMode,
} from "./perf-mode";

interface PerfContextValue {
  mode: PerfMode;
  effectiveMode: EffectivePerfMode;
  setMode: (_mode: PerfMode) => void;
}

const PerfContext = createContext<PerfContextValue | undefined>(undefined);

export function PerfModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<PerfMode>("auto");
  const [effectiveMode, setEffectiveMode] = useState<EffectivePerfMode>("normal");

  useEffect(() => {
    const initial = loadPerfMode();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeState(initial);
    setEffectiveMode(computeEffectiveMode(initial));
  }, []);

  const setMode = useCallback((next: PerfMode) => {
    setModeState(next);
    savePerfMode(next);
    setEffectiveMode(computeEffectiveMode(next));
  }, []);

  const value = useMemo(() => ({ mode, effectiveMode, setMode }), [effectiveMode, mode, setMode]);

  return <PerfContext.Provider value={value}>{children}</PerfContext.Provider>;
}

export function usePerfMode() {
  const ctx = useContext(PerfContext);
  if (!ctx) {
    throw new Error("usePerfMode must be used within PerfModeProvider");
  }
  return ctx;
}
