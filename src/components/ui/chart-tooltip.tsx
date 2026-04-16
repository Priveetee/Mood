"use client";

import type * as React from "react";
import type { TooltipContentProps, TooltipPayload, TooltipPayloadEntry } from "recharts";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";
import { useChart } from "./chart-context";
import { getPayloadConfigFromPayload } from "./chart-utils";

export const ChartTooltip = RechartsPrimitive.Tooltip;

type ChartTooltipContentProps = Partial<TooltipContentProps> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
  };

function getEntryKey(entry: TooltipPayloadEntry, index: number): React.Key {
  const raw = entry.dataKey;
  if (typeof raw === "string" || typeof raw === "number") {
    return raw;
  }
  if (typeof entry.name === "string" || typeof entry.name === "number") {
    return entry.name;
  }
  return index;
}

function normalizePayload(payload?: TooltipPayload): TooltipPayload {
  return payload ?? [];
}

export function ChartTooltipContent({
  active,
  payload,
  className,
  hideLabel = false,
}: ChartTooltipContentProps) {
  const { config } = useChart();
  const safePayload = normalizePayload(payload);

  if (!active || safePayload.length === 0) {
    return null;
  }

  const item = safePayload[0];
  const key = `${item.dataKey || item.name || "value"}`;
  const itemConfig = getPayloadConfigFromPayload(config, item, key);

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!hideLabel && <div className="font-medium">{itemConfig?.label || item.name}</div>}
      <div className="grid gap-1.5">
        {safePayload
          .filter((entry: TooltipPayloadEntry) => entry.type !== "none")
          .map((entry: TooltipPayloadEntry, index) => (
            <div
              key={getEntryKey(entry, index)}
              className="flex items-center justify-between gap-2"
            >
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="text-foreground font-mono font-medium tabular-nums">
                {entry.value?.toLocaleString()}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
