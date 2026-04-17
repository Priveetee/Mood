"use client";

import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { publicTrpc } from "@/lib/trpc";

const DEFAULT_SILK_COLOR = "#6b7280";

export function usePublicResultsController(token: string) {
  const query = publicTrpc.poll.getPublicResultsByToken.useQuery(token, {
    staleTime: 3_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 5_000,
  });

  useEffect(() => {
    if (query.isError) {
      toast.error(query.error.message);
    }
  }, [query.error?.message, query.isError]);

  const silkColor = useMemo(() => {
    const dominant = query.data?.moodDistribution
      ?.slice()
      ?.sort((left, right) => right.votes - left.votes)?.[0];
    return dominant?.fill ?? DEFAULT_SILK_COLOR;
  }, [query.data?.moodDistribution]);

  return {
    query,
    silkColor,
  };
}
