"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

let isRedirectingToLogin = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUnauthorizedError(error: unknown) {
  if (!isRecord(error)) {
    return false;
  }

  const data = error.data;
  if (!isRecord(data)) {
    return false;
  }

  const code = data.code;
  const httpStatus = data.httpStatus;
  return code === "UNAUTHORIZED" || httpStatus === 401;
}

function redirectToLoginOnUnauthorized(error: unknown) {
  if (typeof window === "undefined" || isRedirectingToLogin || !isUnauthorizedError(error)) {
    return;
  }

  isRedirectingToLogin = true;
  const loginUrl = new URL("/login", window.location.origin);
  loginUrl.searchParams.set("auth_error", "unauthorized");
  window.location.replace(loginUrl.toString());
}

export default function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...QUERY_CACHE_OPTIONS,
            retry: (failureCount, error) => !isUnauthorizedError(error) && failureCount < 2,
          },
        },
        queryCache: new QueryCache({ onError: redirectToLoginOnUnauthorized }),
        mutationCache: new MutationCache({ onError: redirectToLoginOnUnauthorized }),
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
