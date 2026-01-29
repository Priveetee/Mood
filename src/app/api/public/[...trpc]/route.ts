import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

const handler = async (req: Request) => {
  console.log(`[PUBLIC TRPC] ${req.method} ${req.url}`);
  return fetchRequestHandler({
    endpoint: "/api/public/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const ctx = await createContext({ req });
      console.log("[PUBLIC TRPC] Context created");
      return ctx;
    },
    onError: ({ error, path }) => {
      console.error(`[PUBLIC TRPC ERROR] path: ${path}, error:`, error);
    },
  });
};

export { handler as GET, handler as POST };
