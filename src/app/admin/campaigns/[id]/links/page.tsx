"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Copy, Send } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCampaignLinksController } from "./use-campaign-links-controller";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function CampaignLinksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const campaignId = Number(id);
  const data = useCampaignLinksController(campaignId);

  if (!data) {
    return null;
  }

  if (data.linksQuery.isLoading || data.campaignQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
      </div>
    );
  }

  const handleCopyAll = () => {
    const allLinks = data.generatedLinks
      .map((link) => `${link.managerName}: ${link.url}`)
      .join("\n");
    data.copyToClipboard(allLinks, "Tous les liens ont ete copies !");
  };

  const handleSendEmail = () => {
    const allLinks = data.generatedLinks
      .map((link) => `${link.managerName}: ${link.url}`)
      .join("\n");
    const subject = `Liens pour la campagne de sondage: ${data.campaignName}`;
    const body = `Bonjour,\n\nVoici les liens de sondage :\n\n${allLinks}\n\nCordialement.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast.info("Ouverture de votre client de messagerie...");
  };

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
          <Link
            href="/admin/campaigns/new"
            className="text-slate-400 transition-colors hover:text-white"
          >
            Creer une autre campagne
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-lg">
            <CardHeader className="flex flex-col items-start justify-between gap-4 p-8 md:flex-row">
              <div>
                <CardTitle className="text-3xl font-bold text-white sm:text-4xl">
                  {data.campaignName} - Liens
                </CardTitle>
                <p className="mt-1 text-slate-400">
                  {data.generatedLinks.length} liens ont ete crees.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 border-slate-700 bg-slate-800 text-slate-200"
                  onClick={handleCopyAll}
                >
                  <Copy className="h-4 w-4" /> Copier tout
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-slate-700 bg-slate-800 text-slate-200"
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
                  {data.generatedLinks.map((link) => (
                    <motion.div variants={itemVariants} key={link.url}>
                      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                        <span className="text-sm font-mono text-slate-300">
                          {link.managerName}: {link.url}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                          onClick={() =>
                            data.copyToClipboard(
                              `${link.managerName}: ${link.url}`,
                              "Lien du manager copie !",
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
      </div>
    </div>
  );
}
