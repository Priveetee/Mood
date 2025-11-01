"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React, { useState } from "react";
import superjson from "superjson";

import { publicTrpc } from "./public-client";

export default function PublicTRPCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    publicTrpc.createClient({
      links: [
        httpBatchLink({
          url: "/api/public",
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
