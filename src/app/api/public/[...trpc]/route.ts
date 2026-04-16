import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createPublicContext } from "@/server/context";
import { publicRouter } from "@/server/routers/public";

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/public/trpc",
    req,
    router: publicRouter,
    createContext: () => createPublicContext(req),
  });
};

export { handler as GET, handler as POST };
