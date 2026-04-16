"use client";

import * as React from "react";
import type { ChartConfig } from "./chart-types";

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function ChartProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: ChartConfig;
}) {
  return <ChartContext.Provider value={{ config }}>{children}</ChartContext.Provider>;
}

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}
