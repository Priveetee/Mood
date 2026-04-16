import { router } from "../trpc";
import { authRouter } from "./auth";
import { pollRouter } from "./poll";

export const publicRouter = router({
  auth: authRouter,
  poll: pollRouter,
});

export type PublicRouter = typeof publicRouter;
