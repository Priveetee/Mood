import { router } from "../trpc";
import { campaignRouter } from "./campaign";
import { pollRouter } from "./poll";

export const appRouter = router({
  campaign: campaignRouter,
  poll: pollRouter,
});

export type AppRouter = typeof appRouter;
