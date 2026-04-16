"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar as CalendarIcon, Plus, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useNewCampaignController } from "./use-new-campaign-controller";

export default function NewCampaignPage() {
  const controller = useNewCampaignController();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 pt-24 sm:p-8 sm:pt-8">
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-lg">
            <CardHeader className="p-8">
              <CardTitle className="text-4xl font-bold text-white">Nouvelle Campagne</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8 pt-0">
              <Input
                value={controller.campaignName}
                onChange={(event) => controller.setCampaignName(event.target.value)}
                placeholder="Nom de la campagne"
                className="h-12 border-slate-700 bg-slate-800 text-lg text-white placeholder:text-slate-400"
              />

              <div className="flex gap-2">
                <Input
                  value={controller.currentManager}
                  onChange={(event) => controller.setCurrentManager(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      controller.handleAddManager();
                    }
                  }}
                  placeholder="Ajouter un manager"
                  className="h-12 border-slate-700 bg-slate-800 text-lg text-white placeholder:text-slate-400"
                />
                <Button
                  type="button"
                  size="icon"
                  className="h-12 w-12 flex-shrink-0"
                  onClick={controller.handleAddManager}
                  disabled={!controller.currentManager.trim()}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-12 w-full justify-start text-left text-lg font-normal border-slate-700 bg-slate-800 text-white",
                      !controller.expiresAt && "text-slate-400",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {controller.expiresAt
                      ? format(controller.expiresAt, "PPP", { locale: fr })
                      : "Date d'expiration (optionnel)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-slate-800 bg-slate-900 p-0 text-white">
                  <Calendar
                    mode="single"
                    selected={controller.expiresAt}
                    onSelect={controller.setExpiresAt}
                    initialFocus
                    locale={fr}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-200">
                    Commentaires obligatoires
                  </span>
                  <span className="text-xs text-slate-400">
                    Chaque vote devra inclure un commentaire.
                  </span>
                </div>
                <Switch
                  checked={controller.commentsRequired}
                  onCheckedChange={controller.setCommentsRequired}
                />
              </div>

              {controller.managers.length > 0 && (
                <ScrollArea className="h-48 w-full">
                  <div className="flex flex-wrap gap-3 p-1">
                    {controller.managers.map((manager) => (
                      <Badge
                        key={manager}
                        variant="secondary"
                        className="bg-slate-700 py-1 px-3 text-base text-slate-200"
                      >
                        {manager}
                        <button
                          type="button"
                          onClick={() => controller.handleRemoveManager(manager)}
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
                onClick={controller.handleGenerate}
                className="h-12 w-full text-lg font-semibold"
                disabled={
                  !controller.campaignName ||
                  controller.managers.length === 0 ||
                  controller.createCampaign.isPending
                }
              >
                {controller.createCampaign.isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-100 border-t-transparent" />
                ) : (
                  "Generer les liens"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
