import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/public/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
  });

export { handler as GET, handler as POST };
