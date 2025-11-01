import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createPublicContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/public",
    req,
    router: appRouter,
    createContext: createPublicContext,
  });

export { handler as GET, handler as POST };
