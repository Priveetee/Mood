import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/public/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const ctx = await createContext({ req });
      return ctx;
    },
  });
};

export { handler as GET, handler as POST };
