import { headers } from "next/headers";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

interface CreateContextOptions {
  req: Request;
  session?: typeof auth.$Infer.Session | null;
}

export async function createContext({ req: _req, session }: CreateContextOptions) {
  const finalSession =
    session !== undefined
      ? session
      : await auth.api.getSession({
          headers: await headers(),
        });

  return {
    session: finalSession,
    prisma,
    req: _req,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export async function createPublicContext(req: Request) {
  return {
    session: null,
    prisma,
    req,
  };
}
