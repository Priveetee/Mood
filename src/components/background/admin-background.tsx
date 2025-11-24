"use client";

import { useEffect, useState } from "react";
import Silk from "@/components/Silk";

interface AdminBackgroundProps {
  color: string;
}

export default function AdminBackground({ color }: AdminBackgroundProps) {
  const [simple, setSimple] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSimple(window.__moodAdminSimpleBg === true);
    const handler = () => {
      setSimple(window.__moodAdminSimpleBg === true);
    };
    window.addEventListener("mood-admin-simple-bg-change", handler);
    return () => {
      window.removeEventListener("mood-admin-simple-bg-change", handler);
    };
  }, []);

  if (simple) {
    return (
      <div className="fixed top-0 left-0 -z-10 h-screen w-screen bg-gradient-to-br from-[#050816] via-[#111827] to-[#020617]" />
    );
  }

  return (
    <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
      <Silk color={color} />
    </div>
  );
}
