"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

const darkThemeColor = "#3f3f5a";

interface ThemeContextType {
  silkColor: string;
  setSilkColor: (color: string) => void;
  isDarkTheme: boolean;
  setIsDarkTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [silkColor, setSilkColor] = useState(darkThemeColor);

  return (
    <ThemeContext.Provider value={{ silkColor, setSilkColor, isDarkTheme, setIsDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
