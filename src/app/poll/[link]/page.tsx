"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Silk from "@/components/Silk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const moods = [
  { name: "green", emoji: "😄", label: "Très bien", color: "#22c55e" },
  { name: "blue", emoji: "🙂", label: "Neutre", color: "#38bdf8" },
  { name: "yellow", emoji: "😕", label: "Moyen", color: "#e7f708" },
  { name: "red", emoji: "😠", label: "Pas bien", color: "#ef4444" },
];

const DEFAULT_SILK_COLOR = "#1a1a2e";

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const pollToken = params.link as string;

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [silkColor, setSilkColor] = useState(DEFAULT_SILK_COLOR);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [pollExists, setPollExists] = useState(true);

  useEffect(() => {
    async function checkPollStatus() {
      if (!pollToken) {
        setPollExists(false);
        setIsLoading(false);
        router.replace("/poll/closed");
        return;
      }

      try {
        const response = await fetch(
          `/api/votes/status?pollLinkId=${pollToken}`,
        );
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404 || response.status === 400) {
            setPollExists(false);
            toast.error("Le lien de sondage est invalide ou expiré.");
          } else {
            throw new Error(
              data.error || "Erreur de vérification du statut du sondage.",
            );
          }
          router.replace("/poll/closed");
        } else {
          if (data.hasVoted) {
            setHasVoted(true);
            toast.info("Vous avez déjà voté pour ce sondage.");
          } else {
            setHasVoted(false);
          }
        }
      } catch (error) {
        setPollExists(false);
        toast.error("Erreur de connexion au serveur de sondage.");
        router.replace("/poll/closed");
      } finally {
        setIsLoading(false);
      }
    }

    checkPollStatus();
  }, [pollToken, router]);

  const handleMoodChange = (value: string) => {
    setSelectedMood(value);
    if (value) {
      const mood = moods.find((m) => m.name === value);
      setSilkColor(mood?.color || DEFAULT_SILK_COLOR);
    } else {
      setSilkColor(DEFAULT_SILK_COLOR);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    if (!selectedMood) {
      toast.error("Veuillez sélectionner une humeur.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pollLinkId: pollToken,
          mood: selectedMood,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.redirect) {
          toast.info(data.error || "Vous avez déjà voté pour ce sondage.");
          router.replace(data.redirect);
          return;
        }
        throw new Error(
          data.error || "Erreur lors de l'enregistrement du vote.",
        );
      }

      toast.success(
        "Votre vote a bien été envoyé. Merci de votre participation !",
      );
      setHasVoted(true);
      router.replace("/poll/closed?voted=true");
    } catch (error: any) {
      toast.error(error.message || "Échec de l'enregistrement du vote.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !pollExists) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 left-0 -z-10 h-screen w-screen">
        <Silk
          color={silkColor}
          scale={2.5}
          speed={3}
          noiseIntensity={1.2}
          rotation={0.1}
        />
      </div>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="w-full max-w-2xl rounded-2xl border-slate-800 bg-slate-900/80 text-white backdrop-blur-lg">
          <CardHeader className="pt-10">
            <CardTitle className="text-center text-4xl font-bold tracking-tight">
              Comment vous sentez-vous ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 p-10">
            <ToggleGroup
              type="single"
              value={selectedMood ?? ""}
              onValueChange={handleMoodChange}
              className="flex w-full items-center justify-between"
              disabled={isLoading}
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
                  Laisser un commentaire (optionnel)
                </Label>
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder="Partagez plus de détails ici..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px] resize-none border-slate-700 bg-slate-900/80 placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full bg-slate-200 text-lg font-bold text-slate-900 transition-colors hover:bg-slate-300"
                disabled={!selectedMood || isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
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
