import { router } from "../trpc";
import { campaignRouter } from "./campaign";
import { resultsRouter } from "./results";

export const appRouter = router({
  campaign: campaignRouter,
  results: resultsRouter,
});

export type AppRouter = typeof appRouter;
