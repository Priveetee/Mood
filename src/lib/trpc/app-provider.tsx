"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import type React from "react";
import { useState } from "react";
import superjson from "superjson";

import { trpc } from "./app-client";

const QUERY_CACHE_OPTIONS = {
  staleTime: 30_000,
  gcTime: 600_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export default function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: QUERY_CACHE_OPTIONS,
        },
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
