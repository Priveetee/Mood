"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { publicTrpc } from "@/lib/trpc";
import { DEFAULT_SILK_COLOR, moods } from "./moods";

export function usePollPageController(pollToken: string) {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
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

  useEffect(() => {
    if (infoQuery.isError) {
      toast.error(infoQuery.error.message);
      router.replace("/poll/closed");
    }
  }, [infoQuery.isError, infoQuery.error, router]);

  const submitVote = publicTrpc.poll.submitVote.useMutation({
    onSuccess: () => {
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
    if (commentsRequired && trimmedComment.length === 0) {
      toast.error("Le commentaire est obligatoire pour cette campagne.");
      return;
    }
    submitVote.mutate({
      pollToken,
      mood: selectedMood as "green" | "blue" | "yellow" | "red",
      comment: trimmedComment || undefined,
    });
  }

  return {
    infoQuery,
    selectedMood,
    setSelectedMood,
    comment,
    setComment,
    silkColor,
    commentsRequired,
    submitVote,
    handleMoodChange,
    handleSubmit,
  };
}
