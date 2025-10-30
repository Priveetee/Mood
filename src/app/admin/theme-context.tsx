"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

const lightThemeColor = "#64748b";
const darkThemeColor = "#3f3f5a";

interface CustomThemeContextType {
  isDarkTheme: boolean;
  setIsDarkTheme: (isDark: boolean) => void;
  silkColor: string;
  setSilkColor: (color: string) => void;
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(
  undefined,
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark">
      <CustomThemeProvider>{children}</CustomThemeProvider>
    </NextThemesProvider>
  );
}

function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme();
  const [silkColor, setSilkColor] = useState(darkThemeColor);

  const isDarkTheme = theme === "dark";

  const setIsDarkTheme = (isDark: boolean) => {
    setTheme(isDark ? "dark" : "light");
  };

  useEffect(() => {
    setSilkColor(isDarkTheme ? darkThemeColor : lightThemeColor);
  }, [isDarkTheme]);

  return (
    <CustomThemeContext.Provider
      value={{ isDarkTheme, setIsDarkTheme, silkColor, setSilkColor }}
    >
      {children}
    </CustomThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(CustomThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
