import { router } from "../trpc";
import { campaignRouter } from "./campaign";
import { pollRouter } from "./poll";
import { resultsRouter } from "./results";
import { authRouter } from "./auth";

export const appRouter = router({
  campaign: campaignRouter,
  poll: pollRouter,
  results: resultsRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
