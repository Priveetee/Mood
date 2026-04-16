import { createTRPCReact } from "@trpc/react-query";
import type { PublicRouter } from "@/server/routers/public";

export const publicTrpc = createTRPCReact<PublicRouter>({});
