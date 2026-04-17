"use client";

import { useTheme } from "next-themes";
import { Suspense, useEffect } from "react";
import { AdminTopBar, AnimatedAdminBackground } from "@/app/admin/components";
import { darkThemeColor, lightThemeColor } from "@/app/admin/constants";
import { PerfModeProvider } from "@/lib/perf/perf-mode-context";
import { TRPCProvider } from "@/lib/trpc";
import { SilkProvider } from "./silk-context";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const color = theme === "light" ? lightThemeColor : darkThemeColor;
    window.dispatchEvent(new CustomEvent("mood-admin-silk-color-change", { detail: { color } }));
  }, [theme]);

  return (
    <TRPCProvider>
      <SilkProvider>
        <AnimatedAdminBackground />
        <AdminTopBar />
        <div className="min-h-screen pt-20 text-slate-50 font-admin sm:pt-0">
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PerfModeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </PerfModeProvider>
  );
}
