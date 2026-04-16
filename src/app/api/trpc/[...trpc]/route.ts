import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { createContext } from "@/server/context";
import { appRouter } from "@/server/routers/_app";

const handler = async (req: Request) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const ctx = await createContext({ req, session });
      return ctx;
    },
  });
};

export { handler as GET, handler as POST };
