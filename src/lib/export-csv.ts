import { format } from "date-fns";

interface VoteData {
  date?: string;
  campaign?: string;
  manager?: string;
  user?: string;
  mood?: string;
  comment?: string;
}

export const exportToCSV = (votes: VoteData[], campaignName: string) => {
  if (votes.length === 0) {
    throw new Error("Aucune donnée à exporter");
  }

  const csvRows = [];

  csvRows.push([
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

    csvRows.push([
      vote.date || "",
      vote.campaign || "",
      vote.manager || "",
      vote.user || "Anonyme",
      moodLabel,
      `"${(vote.comment || "Sans commentaire").replace(/"/g, '""')}"`,
    ]);
  });

  const csvContent = csvRows.map((row) => row.join(",")).join("\n");
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
