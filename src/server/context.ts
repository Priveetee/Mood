import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

interface CreateContextOptions {
  req: Request;
  session?: typeof auth.$Infer.Session | null;
}

export async function createContext({
  req: _req,
  session,
}: CreateContextOptions) {
  const finalSession =
    session !== undefined
      ? session
      : await auth.api.getSession({
          headers: await headers(),
        });

  return {
    session: finalSession,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export async function createPublicContext() {
  return {
    session: null,
    prisma,
  };
}

export type PublicContext = Awaited<ReturnType<typeof createPublicContext>>;
