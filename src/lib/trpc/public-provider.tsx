"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import type React from "react";
import { useState } from "react";
import superjson from "superjson";

import { publicTrpc } from "./public-client";

const QUERY_CACHE_OPTIONS = {
  staleTime: 60_000,
  gcTime: 600_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export default function PublicTRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: QUERY_CACHE_OPTIONS,
        },
      }),
  );
  const [trpcClient] = useState(() =>
    publicTrpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/public/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );
  return (
    <publicTrpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </publicTrpc.Provider>
  );
}
