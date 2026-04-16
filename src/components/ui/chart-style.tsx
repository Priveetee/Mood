"use client";

import type { ChartConfig } from "./chart-types";

const THEMES = { light: "", dark: ".dark" } as const;

export function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.theme || itemConfig.color,
  );
  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) =>
              `${prefix} [data-chart=${id}] {\n${colorConfig
                .map(([key, itemConfig]) => {
                  const color = itemConfig.theme?.[theme as "light" | "dark"] || itemConfig.color;
                  return color ? `  --color-${key}: ${color};` : null;
                })
                .join("\n")}\n}`,
          )
          .join("\n"),
      }}
    />
  );
}
