"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { Switch } from "@/components/ui/switch";

export default function NewCampaignPage() {
  const router = useRouter();

  const [campaignName, setCampaignName] = useState("");
  const [currentManager, setCurrentManager] = useState("");
  const [managers, setManagers] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [commentsRequired, setCommentsRequired] = useState(false);

  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Campagne "${data.campaignName}" générée avec ${data.generatedLinks.length} liens.`,
      );
      router.push(`/admin/campaigns/${data.campaignId}/links`);
    },
    onError: (error) => {
      toast.error(error.message || "Échec de la création de la campagne.");
    },
  });

  const handleAddManager = () => {
    if (currentManager.trim() && !managers.includes(currentManager.trim())) {
      setManagers([...managers, currentManager.trim()]);
      setCurrentManager("");
      toast.success(`Manager "${currentManager.trim()}" ajouté.`);
    }
  };

  const handleRemoveManager = (managerToRemove: string) => {
    setManagers(managers.filter((manager) => manager !== managerToRemove));
    toast.error(`Manager "${managerToRemove}" supprimé.`);
  };

  const handleGenerate = () => {
    createCampaign.mutate({
      name: campaignName,
      managers: managers,
      expiresAt: expiresAt,
      commentsRequired: commentsRequired,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Dashboard
          </Link>
        </div>

        <motion.div
          key="form"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-lg">
            <CardHeader className="p-8">
              <CardTitle className="text-4xl font-bold text-white">
                Nouvelle Campagne
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8 pt-0">
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Nom de la campagne"
                className="h-12 border-slate-700 bg-slate-800 text-lg text-white placeholder:text-slate-400"
              />

              <div className="flex gap-2">
                <Input
                  value={currentManager}
                  onChange={(e) => setCurrentManager(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddManager();
                    }
                  }}
                  placeholder="Ajouter un manager"
                  className="h-12 border-slate-700 bg-slate-800 text-lg text-white placeholder:text-slate-400"
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-12 w-12 flex-shrink-0"
                  onClick={handleAddManager}
                  disabled={!currentManager.trim()}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-start text-left text-lg font-normal",
                      !expiresAt && "text-slate-400",
                      "border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? (
                      format(expiresAt, "PPP", { locale: fr })
                    ) : (
                      <span>Date d&apos;expiration (optionnel)</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-slate-800 bg-slate-900 p-0 text-white">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    initialFocus
                    locale={fr}
                    disabled={(date) => date < new Date()}
                    classNames={{
                      months:
                        "flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption_label: "text-sm font-medium text-slate-100",
                      nav_button:
                        "h-7 w-7 rounded-md border border-slate-700 bg-transparent p-0 opacity-50 hover:bg-slate-800 hover:opacity-100",
                      head_cell:
                        "w-9 rounded-md text-[0.8rem] font-normal text-slate-400",
                      cell: "relative h-9 w-9 p-0 text-center text-sm [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-800/50 [&:has([aria-selected])]:bg-slate-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 rounded-md p-0 font-normal text-slate-300 hover:bg-slate-800",
                      day_selected:
                        "bg-slate-200 text-slate-900 hover:bg-slate-200 focus:bg-slate-200",
                      day_today: "bg-slate-700 text-slate-100",
                      day_outside: "text-slate-500 opacity-50",
                      day_disabled: "text-slate-600 opacity-50",
                    }}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200">
                    Commentaires obligatoires
                  </span>
                  <span className="text-xs text-slate-400">
                    Si activé, chaque vote devra inclure un commentaire.
                  </span>
                </div>
                <Switch
                  checked={commentsRequired}
                  onCheckedChange={(value) => setCommentsRequired(value)}
                />
              </div>

              {managers.length > 0 && (
                <ScrollArea className="h-48 w-full">
                  <div className="flex flex-wrap gap-3 p-1">
                    {managers.map((manager) => (
                      <Badge
                        key={manager}
                        variant="secondary"
                        className="bg-slate-700 py-1 px-3 text-base text-slate-200"
                      >
                        {manager}
                        <button
                          type="button"
                          onClick={() => handleRemoveManager(manager)}
                          className="ml-2 rounded-full p-0.5 hover:bg-slate-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <Button
                onClick={handleGenerate}
                className="h-12 w-full text-lg font-semibold"
                disabled={
                  !campaignName ||
                  managers.length === 0 ||
                  createCampaign.isPending
                }
              >
                {createCampaign.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-100 border-t-transparent" />
                ) : (
                  "Générer les liens"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
