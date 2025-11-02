"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Silk from "@/components/Silk";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import TRPCProvider from "@/lib/trpc/provider";

const lightThemeColor = "#1a55e0";
const darkThemeColor = "#1e3b80";

function AdminBackground() {
  const { theme } = useTheme();
  const [silkColor, setSilkColor] = useState(darkThemeColor);

  useEffect(() => {
    setSilkColor(theme === "light" ? lightThemeColor : darkThemeColor);
  }, [theme]);

  return (
    <AnimatePresence>
      <motion.div
        key={silkColor}
        className="fixed top-0 left-0 -z-10 h-screen w-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.75 } }}
        exit={{ opacity: 0, transition: { duration: 0.75 } }}
      >
        <Silk color={silkColor} />
      </motion.div>
    </AnimatePresence>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="absolute top-8 right-8 flex items-center space-x-3">
      <Moon className="h-5 w-5 text-slate-400" />
      <Switch
        id="theme-switch"
        checked={theme === "light"}
        onCheckedChange={(isChecked) => setTheme(isChecked ? "light" : "dark")}
      />
      <Sun className="h-6 w-6 text-slate-400" />
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TRPCProvider>
      <AdminBackground />
      <ThemeSwitcher />
      <div className="min-h-screen text-slate-50">{children}</div>
    </TRPCProvider>
  );
}
