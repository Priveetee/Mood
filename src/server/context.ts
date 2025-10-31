import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { type NextApiRequest } from "next";

interface CreateContextOptions {
  req: Request;
}

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
