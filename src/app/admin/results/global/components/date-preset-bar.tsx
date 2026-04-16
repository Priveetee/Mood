"use client";

import { Button } from "@/components/ui/button";
import type { DatePreset } from "../constants";

interface DatePresetBarProps {
  selectedPreset: DatePreset;
  onPresetChange: (_preset: DatePreset) => void;
}

export function DatePresetBar({ selectedPreset, onPresetChange }: DatePresetBarProps) {
  const presets: Array<{ value: DatePreset; label: string }> = [
    { value: "7d", label: "7 jours" },
    { value: "30d", label: "30 jours" },
    { value: "3m", label: "3 mois" },
    { value: "year", label: "Année en cours" },
    { value: "all", label: "Tout" },
  ];

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 sm:p-4">
      <span className="mb-2 block text-sm text-slate-400">Période :</span>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            variant={selectedPreset === preset.value ? "default" : "outline"}
            size="sm"
            onClick={() => onPresetChange(preset.value)}
            className={
              selectedPreset === preset.value
                ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
                : "border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
            }
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
