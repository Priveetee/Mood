"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  X,
  Copy,
  Send,
  Edit,
  Calendar as CalendarIcon,
} from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

interface GeneratedLink {
  managerName: string;
  url: string;
}

export default function NewCampaignPage() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [currentManager, setCurrentManager] = useState("");
  const [managers, setManagers] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [commentsRequired, setCommentsRequired] = useState(false);

  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: (data) => {
      setGeneratedLinks(data.generatedLinks);
      setIsGenerated(true);
      toast.success(
        `Campagne "${data.campaignName}" générée avec ${data.generatedLinks.length} liens.`,
      );
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

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(message);
    });
  };

  const handleCopyAll = () => {
    const allLinks = generatedLinks
      .map((link) => `${link.managerName}: ${link.url}`)
      .join("\n");
    copyToClipboard(allLinks, "Tous les liens ont été copiés !");
  };

  const handleSendEmail = () => {
    const allLinks = generatedLinks
      .map((link) => `${link.managerName}: ${link.url}`)
      .join("\n");
    const subject = `Liens pour la campagne de sondage: ${campaignName}`;
    const body = `Bonjour,\n\nVoici les liens de sondage pour vos équipes respectives :\n\n${allLinks}\n\nCordialement.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    toast.info("Ouverture de votre client de messagerie...");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Dashboard
          </Link>
          {isGenerated && (
            <button
              onClick={() => setIsGenerated(false)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <Edit className="h-4 w-4" />
              Modifier la campagne
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isGenerated ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-lg">
                <CardHeader className="flex flex-row items-start justify-between p-8">
                  <div>
                    <CardTitle className="text-4xl font-bold text-white">
                      {campaignName} - Liens
                    </CardTitle>
                    <p className="text-slate-400 mt-1">
                      {generatedLinks.length} liens ont été créés.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                      onClick={handleCopyAll}
                    >
                      <Copy className="h-4 w-4" /> Copier tout
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                      onClick={handleSendEmail}
                    >
                      <Send className="h-4 w-4" /> Envoyer par email
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <ScrollArea className="h-[400px] w-full">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3 pr-6"
                    >
                      {generatedLinks.map((link, index) => (
                        <motion.div variants={itemVariants} key={index}>
                          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                            <span className="text-slate-300 font-mono text-sm">
                              {link.managerName}: {link.url}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400"
                              onClick={() =>
                                copyToClipboard(
                                  `${link.managerName}: ${link.url}`,
                                  "Lien du manager copié !",
                                )
                              }
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
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
                <CardContent className="p-8 pt-0 space-y-8">
                  <Input
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Nom de la campagne"
                    className="h-12 bg-slate-800 border-slate-700 text-lg text-white placeholder:text-slate-400"
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
                      className="h-12 bg-slate-800 border-slate-700 text-lg text-white placeholder:text-slate-400"
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
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 text-lg",
                          !expiresAt && "text-slate-400",
                          "bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:text-white",
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
                    <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800 text-white">
                      <Calendar
                        mode="single"
                        selected={expiresAt}
                        onSelect={setExpiresAt}
                        initialFocus
                        locale={fr}
                        disabled={(date) => date < new Date()}
                        classNames={{
                          months:
                            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption_label: "text-sm font-medium text-slate-100",
                          nav_button:
                            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-slate-700 rounded-md hover:bg-slate-800",
                          head_cell:
                            "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-slate-800/50 [&:has([aria-selected])]:bg-slate-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-slate-800 text-slate-300",
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
                        <AnimatePresence>
                          {managers.map((manager) => (
                            <motion.div
                              key={manager}
                              layout
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.8, opacity: 0 }}
                            >
                              <Badge
                                variant="secondary"
                                className="text-base py-1 px-3 bg-slate-700 text-slate-200"
                              >
                                {manager}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveManager(manager)}
                                  className="ml-2 rounded-full hover:bg-slate-600 p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  )}
                  <Button
                    onClick={handleGenerate}
                    className="w-full h-12 text-lg font-semibold"
                    disabled={
                      !campaignName ||
                      managers.length === 0 ||
                      createCampaign.isPending
                    }
                  >
                    {createCampaign.isPending ? (
                      <div className="w-5 h-5 border-2 border-slate-100 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Générer les liens"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
