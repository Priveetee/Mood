"use client";

import PublicTRPCProvider from "@/lib/trpc/public-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicTRPCProvider>{children}</PublicTRPCProvider>;
}
