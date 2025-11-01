import { Button } from "@/components/ui/button";

export type DatePreset = "7d" | "30d" | "3m" | "year" | "all";

interface DatePresetBarProps {
  selectedPreset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
}

export function DatePresetBar({
  selectedPreset,
  onPresetChange,
}: DatePresetBarProps) {
  const presets: Array<{ value: DatePreset; label: string }> = [
    { value: "7d", label: "7 jours" },
    { value: "30d", label: "30 jours" },
    { value: "3m", label: "3 mois" },
    { value: "year", label: "Année en cours" },
    { value: "all", label: "Tout" },
  ];

  return (
    <div className="flex items-center gap-2 p-4 rounded-lg bg-slate-900 border border-slate-800">
      <span className="text-sm text-slate-400 mr-2">Période :</span>
      {presets.map((preset) => (
        <Button
          key={preset.value}
          variant={selectedPreset === preset.value ? "default" : "outline"}
          size="sm"
          onClick={() => onPresetChange(preset.value)}
          className={
            selectedPreset === preset.value
              ? "bg-slate-200 text-slate-900 hover:bg-slate-300"
              : "bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
          }
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
