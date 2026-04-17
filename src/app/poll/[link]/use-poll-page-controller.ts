"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { publicTrpc } from "@/lib/trpc";
import { DEFAULT_SILK_COLOR, moods } from "./moods";

export function usePollPageController(pollToken: string) {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [voterKey, setVoterKey] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [silkColor, setSilkColor] = useState(DEFAULT_SILK_COLOR);

  const infoQuery = publicTrpc.poll.getInfoByToken.useQuery(pollToken, {
    retry: false,
    staleTime: 180_000,
    gcTime: 600_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const commentsRequired = infoQuery.data?.commentsRequired ?? false;
  const isServiceCampaign = infoQuery.data?.campaignType === "SERVICE_UNIQUE";
  const allowMultipleVotes = infoQuery.data?.allowMultipleVotes ?? true;
  const services = infoQuery.data?.services ?? [];

  useEffect(() => {
    if (!isServiceCampaign || services.length !== 1 || selectedServiceId) {
      return;
    }
    setSelectedServiceId(services[0].id);
  }, [isServiceCampaign, selectedServiceId, services]);

  useEffect(() => {
    if (!isServiceCampaign || allowMultipleVotes || typeof window === "undefined") {
      return;
    }

    const storageKey = `mood:voter:${pollToken}`;
    try {
      const existing = window.localStorage.getItem(storageKey);
      if (existing) {
        setVoterKey(existing);
        return;
      }

      const generated =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(storageKey, generated);
      setVoterKey(generated);
    } catch {
      const fallback = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setVoterKey(fallback);
    }
  }, [allowMultipleVotes, isServiceCampaign, pollToken]);

  useEffect(() => {
    if (infoQuery.isError) {
      toast.error(infoQuery.error.message);
      router.replace("/poll/closed");
    }
  }, [infoQuery.isError, infoQuery.error, router]);

  const submitVote = publicTrpc.poll.submitVote.useMutation({
    onSuccess: () => {
      if (allowMultipleVotes) {
        setSelectedMood(null);
        setComment("");
        toast.success("Vote enregistre. Vous pouvez revoter.");
        return;
      }
      router.replace("/poll/closed?voted=true");
    },
    onError: (submitError) => {
      if (submitError.data?.code === "CONFLICT") {
        router.replace("/poll/closed?voted=true");
        return;
      }
      toast.error(submitError.message || "Echec de l'enregistrement du vote.");
    },
  });

  function handleMoodChange(value: string) {
    if (!value) {
      return;
    }
    const newColor = moods.find((mood) => mood.name === value)?.color || DEFAULT_SILK_COLOR;
    setSelectedMood(value);
    setSilkColor(newColor);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMood) {
      toast.error("Veuillez selectionner une humeur.");
      return;
    }
    const trimmedComment = comment.trim();
    if (isServiceCampaign && !selectedServiceId) {
      toast.error("Veuillez selectionner un service.");
      return;
    }
    if (commentsRequired && trimmedComment.length === 0) {
      toast.error("Le commentaire est obligatoire pour cette campagne.");
      return;
    }
    submitVote.mutate({
      pollToken,
      mood: selectedMood as "green" | "blue" | "yellow" | "red",
      comment: trimmedComment || undefined,
      serviceId: isServiceCampaign ? selectedServiceId : undefined,
      voterKey: isServiceCampaign && !allowMultipleVotes ? (voterKey ?? undefined) : undefined,
    });
  }

  return {
    infoQuery,
    isServiceCampaign,
    services,
    allowMultipleVotes,
    selectedMood,
    setSelectedMood,
    selectedServiceId,
    setSelectedServiceId,
    comment,
    setComment,
    silkColor,
    commentsRequired,
    submitVote,
    handleMoodChange,
    handleSubmit,
  };
}
