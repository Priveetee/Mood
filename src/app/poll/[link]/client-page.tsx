"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import PollSilk from "@/components/PollSilk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { publicTrpc } from "@/lib/trpc/public-client";

const moods = [
  { name: "green", emoji: "😄", label: "Très bien", color: "#22c55e" },
  { name: "blue", emoji: "🙂", label: "Bien", color: "#38bdf8" },
  { name: "yellow", emoji: "😕", label: "Moyen", color: "#facc15" },
  { name: "red", emoji: "😠", label: "Pas bien", color: "#ef4444" },
];

const DEFAULT_SILK_COLOR = "#1a1a2e";
const TRANSITION_DELAY = 1100;

export default function PollClientPage() {
  const params = useParams();
  const router = useRouter();
  const pollToken = params.link as string;

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [silkColor, setSilkColor] = useState(DEFAULT_SILK_COLOR);

  const {
    data: pollInfo,
    isLoading,
    isError,
    error,
  } = publicTrpc.poll.getInfoByToken.useQuery(pollToken, {
    retry: false,
  });

  const commentsRequired = pollInfo?.commentsRequired ?? false;

  useEffect(() => {
    if (isError) {
      toast.error(error.message);
      router.replace("/poll/closed");
    }
  }, [isError, error, router]);

  const submitVote = publicTrpc.poll.submitVote.useMutation({
    onSuccess: () => {
      toast.success(
        "Votre vote a bien été envoyé. Merci de votre participation !",
      );
      setSelectedMood(null);
      setComment("");
      handleMoodChange(null);
    },
    onError: (submitError) => {
      toast.error(submitError.message || "Échec de l'enregistrement du vote.");
    },
  });

  const handleMoodChange = (value: string | null) => {
    const newColor = value
      ? moods.find((m) => m.name === value)?.color || DEFAULT_SILK_COLOR
      : DEFAULT_SILK_COLOR;

    if (value) {
      setSelectedMood(value);
    } else {
      setSelectedMood(null);
    }

    if (silkColor !== DEFAULT_SILK_COLOR && silkColor !== newColor) {
      setSilkColor(DEFAULT_SILK_COLOR);
      setTimeout(() => {
        setSilkColor(newColor);
      }, TRANSITION_DELAY);
    } else {
      setSilkColor(newColor);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMood) {
      toast.error("Veuillez sélectionner une humeur.");
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
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed left-0 top-0 -z-10 h-screen w-screen">
        <PollSilk color={silkColor} />
      </div>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl rounded-2xl border-slate-800 bg-slate-900/80 text-white backdrop-blur-lg">
          <CardHeader className="pt-10 text-center">
            <CardTitle className="text-4xl font-bold tracking-tight">
              Comment vous sentez-vous ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 p-10">
            <ToggleGroup
              type="single"
              value={selectedMood ?? ""}
              onValueChange={handleMoodChange}
              className="flex w-full items-center justify-between"
              disabled={submitVote.isPending}
            >
              {moods.map((mood) => (
                <ToggleGroupItem
                  key={mood.name}
                  value={mood.name}
                  className={`group flex h-auto w-36 flex-col items-center justify-center gap-4 rounded-xl p-4 transition-all duration-300 focus:outline-none ${
                    selectedMood && selectedMood !== mood.name
                      ? "scale-95 opacity-50"
                      : "scale-100 opacity-100"
                  }`}
                >
                  <span className="text-6xl transition-transform duration-200 group-hover:scale-110">
                    {mood.emoji}
                  </span>
                  <span className="font-semibold text-slate-300">
                    {mood.label}
                  </span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid w-full gap-2">
                <Label
                  htmlFor="comment"
                  className="text-base font-semibold text-slate-300"
                >
                  {commentsRequired
                    ? "Commentaire (obligatoire...)"
                    : "Laisser un commentaire (optionnel)"}
                </Label>
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder={
                    commentsRequired
                      ? "Par exemple : bien, pas bien, normal..."
                      : "Par exemple : bien, pas bien, normal..."
                  }
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px] resize-none border-slate-700 bg-slate-900/80 placeholder:text-slate-500"
                  disabled={submitVote.isPending}
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full bg-slate-200 text-lg font-bold text-slate-900 transition-colors hover:bg-slate-300"
                disabled={!selectedMood || submitVote.isPending}
              >
                {submitVote.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-800 border-t-transparent" />
                ) : (
                  "Envoyer mon vote"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
