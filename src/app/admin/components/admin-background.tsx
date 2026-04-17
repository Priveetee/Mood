"use client";

import { useEffect, useRef, useState } from "react";
import { darkThemeColor } from "@/app/admin/constants";
import { onSilkColorChange } from "@/app/admin/silk-context";
import Silk from "@/components/silk";
import { usePerfMode } from "@/lib/perf/perf-mode-context";
import { initAdminSimpleMode } from "@/lib/simple-mode";

export function AdminBackground() {
  const { effectiveMode, mode } = usePerfMode();
  const [simple, setSimple] = useState(false);
  const [targetColor, setTargetColor] = useState(darkThemeColor);
  const simpleRef = useRef(simple);

  useEffect(() => {
    const initialSimple = initAdminSimpleMode();
    setSimple(initialSimple);
    simpleRef.current = initialSimple;
  }, []);

  useEffect(() => {
    simpleRef.current = simple;
  }, [simple]);

  useEffect(() => {
    const unsubscribe = onSilkColorChange((nextColor) => {
      if (nextColor === "__SIMPLE__") {
        setSimple(true);
        simpleRef.current = true;
        return;
      }

      if (nextColor === "__ANIMATED__") {
        setSimple(false);
        simpleRef.current = false;
        return;
      }

      if (!simpleRef.current) {
        setTargetColor(nextColor);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (simple) {
    return (
      <div className="fixed top-0 left-0 -z-10 h-screen w-screen bg-gradient-to-br from-[#050816] via-[#111827] to-[#020617]" />
    );
  }

  return (
    <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
      <Silk color={targetColor} isStatic={effectiveMode === "low" && mode === "low"} />
    </div>
  );
}
