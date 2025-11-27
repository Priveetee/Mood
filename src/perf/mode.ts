export type PerfMode = "auto" | "normal" | "low";

export type EffectivePerfMode = "normal" | "low";

const STORAGE_KEY = "mood_admin_perf_mode";

export function loadPerfMode(): PerfMode {
  if (typeof window === "undefined") return "auto";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "normal" || stored === "low" || stored === "auto") {
    return stored;
  }
  return "auto";
}

export function savePerfMode(mode: PerfMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, mode);
}

export function computeEffectiveMode(mode: PerfMode): EffectivePerfMode {
  if (mode === "normal") return "normal";
  if (mode === "low") return "low";

  if (typeof navigator !== "undefined") {
    const hc =
      typeof (navigator as Navigator & { hardwareConcurrency?: number })
        .hardwareConcurrency === "number"
        ? (navigator as Navigator & { hardwareConcurrency?: number })
            .hardwareConcurrency
        : undefined;

    if (hc !== undefined && hc <= 4) {
      return "low";
    }
  }

  return "normal";
}
