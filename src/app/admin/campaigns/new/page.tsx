"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Plus, X, Copy, Send, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export default function NewCampaignPage() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [currentManager, setCurrentManager] = useState("");
  const [managers, setManagers] = useState<string[]>([]);
  const [mockGeneratedLinks, setMockGeneratedLinks] = useState<string[]>([]);

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
    const links = managers.map(
      (name) =>
        `${name}: https://mood.app/p/${Math.random().toString(36).substr(2, 8)}`,
    );
    setMockGeneratedLinks(links);
    setIsGenerated(true);
    toast.success(
      `Campagne "${campaignName}" générée avec ${links.length} liens.`,
    );
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.info(message);
    });
  };

  const handleCopyAll = () => {
    const allLinks = mockGeneratedLinks.join("\n");
    copyToClipboard(allLinks, "Tous les liens ont été copiés.");
  };

  const handleSendEmail = () => {
    const allLinks = mockGeneratedLinks.join("\n");
    const subject = `Liens pour la campagne de sondage: ${campaignName}`;
    const body = `Bonjour,\n\nVoici les liens de sondage pour vos équipes respectives :\n\n${allLinks}\n\nCordialement.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        {isGenerated ? (
          <button
            onClick={() => setIsGenerated(false)}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <Edit className="h-4 w-4" />
            Modifier la campagne
          </button>
        ) : (
          <Link
            href="/admin"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Dashboard
          </Link>
        )}

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
                      {mockGeneratedLinks.length} liens ont été créés.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 bg-slate-200 text-slate-900 hover:bg-slate-300"
                      onClick={handleCopyAll}
                    >
                      <Copy className="h-4 w-4" /> Copier tout
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 bg-slate-200 text-slate-900 hover:bg-slate-300"
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
                      {mockGeneratedLinks.map((link, index) => (
                        <motion.div variants={itemVariants} key={index}>
                          <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                            <span className="text-slate-300 font-mono text-sm">
                              {link}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400"
                              onClick={() =>
                                copyToClipboard(link, "Lien copié !")
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
                    className="h-12 bg-slate-800 border-slate-700 text-lg"
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
                      className="h-12 bg-slate-800 border-slate-700 text-lg"
                    />
                    <Button
                      type="button"
                      size="icon"
                      className="h-12 w-12 flex-shrink-0"
                      onClick={handleAddManager}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
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
                    disabled={!campaignName || managers.length === 0}
                  >
                    Générer les liens
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
