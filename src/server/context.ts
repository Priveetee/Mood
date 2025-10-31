import { auth } from "@/auth";
import prisma from "@/lib/prisma";

interface CreateContextOptions {
  req: Request;
}

// CONTEXTE POUR LES ROUTES PROTÉGÉES (ADMIN)
export async function createContext({ req }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  return {
    session,
    prisma,
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;

// CONTEXTE POUR LES ROUTES PUBLIQUES (VOTE)
export async function createPublicContext() {
  return {
    session: null,
    prisma,
  };
}
export type PublicContext = Awaited<ReturnType<typeof createPublicContext>>;
