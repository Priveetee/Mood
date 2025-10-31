import { router } from "../trpc";
import { campaignRouter } from "./campaign";

export const appRouter = router({
  campaign: campaignRouter,
});

export type AppRouter = typeof appRouter;
