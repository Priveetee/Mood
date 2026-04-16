"use client";

import { PublicTRPCProvider } from "@/lib/trpc";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicTRPCProvider>{children}</PublicTRPCProvider>;
}
