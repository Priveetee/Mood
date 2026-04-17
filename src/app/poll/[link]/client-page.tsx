"use client";

import { use } from "react";
import { OpenMojiImage } from "@/components/openmoji-image";
import PollSilk from "@/components/poll-silk";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { moods } from "./moods";
import { usePollPageController } from "./use-poll-page-controller";

export default function PollClientPage({ params }: { params: Promise<{ link: string }> }) {
  const { link } = use(params);
  const controller = usePollPageController(link);

  if (controller.infoQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen">
      <div className="pointer-events-none fixed inset-0 z-0">
        <PollSilk
          color={controller.silkColor}
          speed={5}
          scale={1.05}
          noiseIntensity={1.2}
          rotation={0}
        />
      </div>
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-3 sm:p-4">
        <Card className="w-full max-w-2xl rounded-2xl border-slate-800 bg-slate-900/80 text-white backdrop-blur-lg">
          <CardHeader className="pt-7 text-center sm:pt-10">
            <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comment vous sentez-vous ?
            </CardTitle>
            <p className="text-sm text-slate-300">
              {controller.infoQuery.data?.managerName
                ? `Manager: ${controller.infoQuery.data.managerName}`
                : "Choisissez votre service puis votre humeur."}
            </p>
          </CardHeader>
          <CardContent className="space-y-7 p-4 sm:space-y-10 sm:p-10">
            <ToggleGroup
              type="single"
              value={controller.selectedMood ?? ""}
              onValueChange={controller.handleMoodChange}
              className="grid w-full grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3"
              disabled={controller.submitVote.isPending}
            >
              {moods.map((mood) => (
                <ToggleGroupItem
                  key={mood.name}
                  value={mood.name}
                  className={`group flex h-auto w-full flex-col items-center justify-center gap-3 rounded-xl p-3 transition-all sm:w-36 sm:gap-4 sm:p-4 ${
                    controller.selectedMood && controller.selectedMood !== mood.name
                      ? "scale-95 opacity-50"
                      : "scale-100 opacity-100"
                  }`}
                >
                  <OpenMojiImage
                    code={mood.emojiCode}
                    alt={mood.label}
                    size={56}
                    className="h-12 w-12 transition-transform duration-200 group-hover:scale-110 sm:h-14 sm:w-14"
                  />
                  <span className="font-semibold text-slate-300">{mood.label}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {controller.isServiceCampaign && (
              <div className="grid gap-2">
                <Label htmlFor="service-select" className="text-base font-semibold text-slate-300">
                  Service
                </Label>
                <Select
                  value={controller.selectedServiceId}
                  onValueChange={controller.setSelectedServiceId}
                  disabled={controller.submitVote.isPending}
                >
                  <SelectTrigger
                    id="service-select"
                    className="h-12 border-slate-700 bg-slate-900/80 text-white"
                  >
                    <SelectValue placeholder="Selectionner un service" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-900 text-white">
                    {controller.services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <form onSubmit={controller.handleSubmit} className="space-y-6">
              <div className="grid w-full gap-2">
                <Label htmlFor="comment" className="text-base font-semibold text-slate-300">
                  {controller.commentsRequired
                    ? "Commentaire (obligatoire...)"
                    : "Laisser un commentaire (optionnel)"}
                </Label>
                <Textarea
                  id="comment"
                  name="comment"
                  placeholder="Par exemple : bien, pas bien, normal..."
                  value={controller.comment}
                  onChange={(event) => controller.setComment(event.target.value)}
                  className="min-h-[120px] resize-none border-slate-700 bg-slate-900/80 placeholder:text-slate-500"
                  disabled={controller.submitVote.isPending}
                />
              </div>
              <Button
                type="submit"
                className="h-12 w-full bg-slate-200 text-lg font-bold text-slate-900 transition-colors hover:bg-slate-300"
                disabled={
                  !controller.selectedMood ||
                  (controller.isServiceCampaign && !controller.selectedServiceId) ||
                  controller.submitVote.isPending
                }
              >
                {controller.submitVote.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-800 border-t-transparent" />
                ) : (
                  "Envoyer mon vote"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
