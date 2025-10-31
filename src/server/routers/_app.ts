import { router } from "../trpc";
import { campaignRouter } from "./campaign";
import { pollRouter } from "./poll";
import { resultsRouter } from "./results";

export const appRouter = router({
  campaign: campaignRouter,
  poll: pollRouter,
  results: resultsRouter,
});

export type AppRouter = typeof appRouter;
