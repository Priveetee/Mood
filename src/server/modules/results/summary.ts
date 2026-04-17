export type VoteSummaryInput = {
  mood: string;
  comment: string | null;
  createdAt: Date;
  segment: string;
  source: "manager" | "service";
  campaignName: string;
};

type MoodDistributionItem = {
  name: string;
  votes: number;
  fill: string;
  emojiCode: string;
};

const MOOD_META: Record<string, Omit<MoodDistributionItem, "votes">> = {
  green: { name: "Très bien", fill: "#22c55e", emojiCode: "1F60A" },
  blue: { name: "Bien", fill: "#38bdf8", emojiCode: "1F642" },
  yellow: { name: "Moyen", fill: "#facc15", emojiCode: "1F610" },
  red: { name: "Pas bien", fill: "#ef4444", emojiCode: "2639-FE0F" },
};

export function buildResultsSummary(votes: VoteSummaryInput[]) {
  const moodCounts = { green: 0, blue: 0, yellow: 0, red: 0 };
  const comments: Array<{
    user: string;
    segment: string;
    source: "manager" | "service";
    comment: string;
    mood: string;
  }> = [];

  const allVotes = votes.map((vote) => ({
    date: vote.createdAt.toISOString(),
    campaign: vote.campaignName,
    segment: vote.segment,
    source: vote.source,
    user: "Anonyme",
    mood: vote.mood,
    comment: vote.comment || "",
  }));

  for (const vote of votes) {
    if (vote.mood in moodCounts) {
      moodCounts[vote.mood as keyof typeof moodCounts]++;
    }
    if (vote.comment) {
      comments.push({
        user: "Anonyme",
        segment: vote.segment,
        source: vote.source,
        comment: vote.comment,
        mood: vote.mood,
      });
    }
  }

  const moodDistribution: MoodDistributionItem[] = [
    { ...MOOD_META.green, votes: moodCounts.green },
    { ...MOOD_META.blue, votes: moodCounts.blue },
    { ...MOOD_META.yellow, votes: moodCounts.yellow },
    { ...MOOD_META.red, votes: moodCounts.red },
  ];

  const dominantMood = [...moodDistribution].sort((a, b) => b.votes - a.votes)[0];

  return {
    totalVotes: votes.length,
    moodDistribution,
    comments,
    allVotes,
    dominantMood: dominantMood?.name ?? "N/A",
    dominantMoodEmojiCode: dominantMood?.emojiCode ?? "1F610",
  };
}
