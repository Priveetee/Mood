type VoteWithRelations = {
  mood: string;
  comment: string | null;
  createdAt: Date;
  pollLink: { managerName: string };
  campaign: { name: string };
};

type MoodDistributionItem = {
  name: string;
  votes: number;
  fill: string;
  emoji: string;
};

function toEmoji(...codePoints: number[]) {
  return String.fromCodePoint(...codePoints);
}

const MOOD_META: Record<string, Omit<MoodDistributionItem, "votes">> = {
  green: { name: "Très bien", fill: "#22c55e", emoji: toEmoji(0x1f60a) },
  blue: { name: "Bien", fill: "#38bdf8", emoji: toEmoji(0x1f642) },
  yellow: { name: "Moyen", fill: "#facc15", emoji: toEmoji(0x1f610) },
  red: { name: "Pas bien", fill: "#ef4444", emoji: toEmoji(0x2639, 0xfe0f) },
};

export function buildResultsSummary(votes: VoteWithRelations[]) {
  const moodCounts = { green: 0, blue: 0, yellow: 0, red: 0 };
  const comments: Array<{ user: string; manager: string; comment: string; mood: string }> = [];

  const allVotes = votes.map((vote) => ({
    date: vote.createdAt.toISOString(),
    campaign: vote.campaign.name,
    manager: vote.pollLink.managerName,
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
        manager: vote.pollLink.managerName,
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
    dominantMoodEmoji: dominantMood?.emoji ?? "?",
  };
}
