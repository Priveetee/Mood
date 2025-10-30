"use client";

import { useTheme } from "./theme-context";
import Silk from "@/components/Silk";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";

function AdminBackground() {
  const { silkColor } = useTheme();
  return (
    <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
      <Silk
        color={silkColor}
        scale={2.5}
        speed={3}
        noiseIntensity={1.2}
        rotation={0.1}
      />
    </div>
  );
}

function ThemeSwitcher() {
  const { isDarkTheme, setIsDarkTheme } = useTheme();

  return (
    <div className="absolute top-8 right-8 flex items-center space-x-3">
      <Moon className="h-5 w-5 text-slate-400" />
      <Switch
        id="theme-switch"
        checked={!isDarkTheme}
        onCheckedChange={(isChecked) => setIsDarkTheme(!isChecked)}
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
    <>
      <AdminBackground />
      <ThemeSwitcher />
      <div className="min-h-screen text-white">{children}</div>
    </>
  );
}
