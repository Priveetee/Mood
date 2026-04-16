"use client";

import { Copy, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CampaignLink } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  links: CampaignLink[];
  isLoading: boolean;
  onCopyLink: (value: string) => void;
  onCopyAll: () => void;
  onSendEmail: () => void;
  onOpenAddManager: () => void;
};

export function CampaignLinksDialog({
  open,
  onOpenChange,
  campaignName,
  links,
  isLoading,
  onCopyLink,
  onCopyAll,
  onSendEmail,
  onOpenAddManager,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-slate-800 bg-slate-900 text-white">
        <DialogHeader className="flex-row items-center justify-between pr-6">
          <div className="space-y-1">
            <DialogTitle className="text-white">Gerer la campagne: {campaignName}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {links.length} lien(s) genere(s)
            </DialogDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
              onClick={onCopyAll}
            >
              <Copy className="h-4 w-4" />
              Tout copier
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
              onClick={onSendEmail}
            >
              <Send className="h-4 w-4" />
              Envoyer par mail
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {isLoading && <p>Chargement...</p>}
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">{link.managerName}</p>
                  <p className="truncate text-xs text-slate-400">{link.url}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onCopyLink(link.url)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 flex justify-end">
          <Button className="gap-2" onClick={onOpenAddManager}>
            <Plus className="h-4 w-4" />
            Ajouter un manager
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
