import { toast } from "sonner";
import type { CampaignLink } from "./types";

export function copyToClipboard(text: string) {
  if (!navigator.clipboard || !window.isSecureContext) {
    toast.error("Fonctionnalite non disponible.", {
      description: "La copie est supportee uniquement en localhost ou HTTPS.",
    });
    return;
  }

  navigator.clipboard.writeText(text).then(
    () => {
      toast.success("Lien copie !");
    },
    () => {
      toast.error("Echec de la copie.");
    },
  );
}

export function toLinksText(links: CampaignLink[]) {
  return links.map((link) => `${link.label}: ${link.url}`).join("\n");
}

export function sendLinksByEmail(links: CampaignLink[], campaignName: string) {
  const allLinks = toLinksText(links);
  const subject = `Liens pour la campagne de sondage: ${campaignName}`;
  const body = `Bonjour,\n\nVoici les liens de sondage :\n\n${allLinks}\n\nCordialement.`;
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  toast.info("Ouverture de votre client de messagerie...");
}
