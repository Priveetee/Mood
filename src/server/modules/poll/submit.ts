import type { Context } from "@/server/context";
import { submitManagerVote } from "./submit-manager-vote";
import { submitServiceVote } from "./submit-service-vote";

type SubmitVoteParams = {
  prisma: Context["prisma"];
  pollToken: string;
  mood: "green" | "blue" | "yellow" | "red";
  comment?: string;
  serviceId?: string;
  voterKey?: string;
};

export async function submitVote({
  prisma,
  pollToken,
  mood,
  comment,
  serviceId,
  voterKey,
}: SubmitVoteParams): Promise<{ message: string; voteId: number }> {
  const managerPollLink = await prisma.pollLink.findUnique({
    where: { token: pollToken },
    select: { id: true },
  });

  if (managerPollLink) {
    return submitManagerVote({
      prisma,
      pollToken,
      mood,
      comment,
    });
  }

  return submitServiceVote({
    prisma,
    pollToken,
    mood,
    comment,
    serviceId,
    voterKey,
  });
}
