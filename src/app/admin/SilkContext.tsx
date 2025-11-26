"use client";

import { createContext, useContext, ReactNode } from "react";

interface SilkContextType {
  setSilkColorAction: (_color: string) => void;
}

const SilkContext = createContext<SilkContextType | undefined>(undefined);

export function SilkProvider({
  setSilkColorAction,
  children,
}: {
  setSilkColorAction: (_color: string) => void;
  children: ReactNode;
}) {
  return (
    <SilkContext.Provider value={{ setSilkColorAction }}>
      {children}
    </SilkContext.Provider>
  );
}

export function useSilk() {
  const context = useContext(SilkContext);
  if (context === undefined) {
    throw new Error("useSilk must be used within a SilkProvider");
  }
  return context;
}
