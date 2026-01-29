"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon, Cpu } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import TRPCProvider from "@/lib/trpc/provider";
import { SilkProvider } from "./SilkContext";
import AdminBackground from "@/components/background/admin-background";
import { initAdminSimpleMode, setAdminSimpleMode } from "@/lib/simple-mode";
import { PerfModeProvider, usePerfMode } from "@/perf/context";

const lightThemeColor = "#1a55e0";
const darkThemeColor = "#29204b";

function AnimatedAdminBackground({ color }: { color: string }) {
  return (
    <AnimatePresence>
      <motion.div
        key={color}
        className="fixed top-0 left-0 -z-10 h-screen w-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.75 } }}
        exit={{ opacity: 0, transition: { duration: 0.75 } }}
      >
        <AdminBackground color={color} />
      </motion.div>
    </AnimatePresence>
  );
}

function TopBar() {
  const { theme, setTheme } = useTheme();
  const { mode, setMode } = usePerfMode();
  const [simpleBg, setSimpleBg] = useState(false);

  useEffect(() => {
    const initialBg = initAdminSimpleMode();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSimpleBg(initialBg);
    if (initialBg) {
      setMode("low");
    }
  }, [setMode]);

  const handleSimpleToggle = (value: boolean) => {
    setSimpleBg(value);
    setAdminSimpleMode(value);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("mood-admin-simple-bg-change"));
    }
    setMode(value ? "low" : "normal");
  };

  const cpuChecked = simpleBg || mode === "low";

  return (
    <div className="absolute top-8 right-8 flex items-center space-x-6">
      <div className="flex items-center space-x-2">
        <Cpu className="h-5 w-5 text-slate-400" />
        <Switch
          id="simple-mode-switch"
          checked={cpuChecked}
          onCheckedChange={handleSimpleToggle}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Moon className="h-5 w-5 text-slate-400" />
        <Switch
          id="theme-switch"
          checked={theme === "light"}
          onCheckedChange={(isChecked) =>
            setTheme(isChecked ? "light" : "dark")
          }
        />
        <Sun className="h-6 w-6 text-slate-400" />
      </div>
    </div>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [silkColor, setSilkColor] = useState(darkThemeColor);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSilkColor(theme === "light" ? lightThemeColor : darkThemeColor);
  }, [theme]);

  return (
    <TRPCProvider>
      <SilkProvider setSilkColorAction={setSilkColor}>
        <AnimatedAdminBackground color={silkColor} />
        <TopBar />
        <div className="min-h-screen text-slate-50">
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
              </div>
            }
          >
            {children}
          </Suspense>
        </div>
      </SilkProvider>
    </TRPCProvider>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PerfModeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </PerfModeProvider>
  );
}
