"use client";

import { AdminBackground } from "./admin-background";

export function AnimatedAdminBackground() {
  return (
    <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
      <AdminBackground />
    </div>
  );
}
