import { format } from "date-fns";

interface VoteData {
  date?: string;
  campaign?: string;
  manager?: string;
  user?: string;
  mood?: string;
  comment?: string;
}

const SEP = ";";

function escapeCsvField(value: string): string {
  const v = value ?? "";
  if (v === "") return "";
  const needsQuote = /["\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export const exportToCSV = (votes: VoteData[], campaignName: string) => {
  if (votes.length === 0) {
    throw new Error("Aucune donnée à exporter");
  }

  const rows: string[][] = [];

  rows.push([
    "Date",
    "Campagne",
    "Manager",
    "Utilisateur",
    "Humeur",
    "Commentaire",
  ]);

  votes.forEach((vote) => {
    const moodLabel =
      vote.mood === "green"
        ? "Très bien"
        : vote.mood === "blue"
          ? "Bien"
          : vote.mood === "yellow"
            ? "Moyen"
            : vote.mood === "red"
              ? "Pas bien"
              : "Inconnu";

    const rawComment = vote.comment || "Sans commentaire";
    const safeComment = rawComment.replace(/,/g, "\\");

    rows.push([
      vote.date || "",
      vote.campaign || "",
      vote.manager || "",
      vote.user || "Anonyme",
      moodLabel,
      safeComment,
    ]);
  });

  const csvContent = rows
    .map((row) => row.map(escapeCsvField).join(SEP))
    .join("\n");

  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm");
  link.download = `resultats_${campaignName}_${timestamp}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
