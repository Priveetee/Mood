"use client";

import { useState } from "react";
import Silk from "@/components/Silk";
import { Switch } from "@/components/ui/switch";
//import { Label } from "@/components/ui/label";
import { Sun, Moon } from "lucide-react";

const lightThemeColor = "#64748b";
const darkThemeColor = "#3f3f5a";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  return (
    <>
      <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
        <Silk
          color={isDarkTheme ? darkThemeColor : lightThemeColor}
          scale={2.5}
          speed={3}
          noiseIntensity={1.2}
          rotation={0.1}
        />
      </div>
      <div className="absolute top-8 right-8 flex items-center space-x-3">
        <Moon className="h-5 w-5 text-slate-400" />
        <Switch
          id="theme-switch"
          checked={!isDarkTheme}
          onCheckedChange={() => setIsDarkTheme(!isDarkTheme)}
        />
        <Sun className="h-6 w-6 text-slate-400" />
      </div>
      <div className="min-h-screen text-white">{children}</div>
    </>
  );
}
