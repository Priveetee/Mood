import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";
import { auth } from "@/auth";
import { headers } from "next/headers";

const handler = async (req: Request) => {
  console.log(`[AUTH TRPC] ${req.method} ${req.url}`);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const ctx = await createContext({ req, session });
      console.log(
        `[AUTH TRPC] Context created for user: ${session?.user?.email || "anonymous"}`,
      );
      return ctx;
    },
    onError: ({ error, path }) => {
      console.error(`[AUTH TRPC ERROR] path: ${path}, error:`, error);
    },
  });
};

export { handler as GET, handler as POST };
