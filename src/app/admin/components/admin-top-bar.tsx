"use client";

import { Cpu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { darkThemeColor, lightThemeColor } from "@/app/admin/constants";
import { Switch } from "@/components/ui/switch";
import { usePerfMode } from "@/lib/perf/perf-mode-context";
import { initAdminSimpleMode, setAdminSimpleMode } from "@/lib/simple-mode";

function dispatchSilkColor(color: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("mood-admin-silk-color-change", { detail: { color } }));
}

export function AdminTopBar() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { setMode } = usePerfMode();
  const [simpleBg, setSimpleBg] = useState(false);
  const [mounted, setMounted] = useState(false);

  const activeTheme = (resolvedTheme ?? theme) === "light" ? "light" : "dark";

  const currentThemeColor = useMemo(
    () => (activeTheme === "light" ? lightThemeColor : darkThemeColor),
    [activeTheme],
  );

  useEffect(() => {
    const initialBg = initAdminSimpleMode();
    setMounted(true);
    setSimpleBg(initialBg);
    dispatchSilkColor(initialBg ? "__SIMPLE__" : "__ANIMATED__");
    if (!initialBg) {
      dispatchSilkColor(currentThemeColor);
    }
    if (initialBg) {
      setMode("low");
    }
  }, [currentThemeColor, setMode]);

  useEffect(() => {
    if (!mounted || simpleBg) {
      return;
    }

    dispatchSilkColor("__ANIMATED__");
    dispatchSilkColor(currentThemeColor);
  }, [currentThemeColor, mounted, simpleBg]);

  const handleSimpleToggle = (value: boolean) => {
    if (!mounted) {
      return;
    }

    setSimpleBg(value);
    setAdminSimpleMode(value);
    dispatchSilkColor(value ? "__SIMPLE__" : "__ANIMATED__");
    if (!value) {
      dispatchSilkColor(currentThemeColor);
    }
    setMode(value ? "low" : "normal");
  };

  const cpuChecked = simpleBg;

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-3 sm:top-8 sm:right-8 sm:flex-row sm:items-center sm:space-x-6 sm:gap-0">
      <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 backdrop-blur sm:space-x-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <Cpu className="h-5 w-5 text-slate-400" />
        <Switch
          id="simple-mode-switch"
          checked={cpuChecked}
          onCheckedChange={handleSimpleToggle}
          disabled={!mounted}
        />
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 backdrop-blur sm:space-x-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <Moon className="h-5 w-5 text-slate-400" />
        <Switch
          id="theme-switch"
          checked={activeTheme === "light" && mounted}
          onCheckedChange={(isChecked) => setTheme(isChecked ? "light" : "dark")}
          disabled={!mounted}
        />
        <Sun className="h-6 w-6 text-slate-400" />
      </div>
    </div>
  );
}
