import { APIError, betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

const SIGN_UP_PATH = "/sign-up/email";

function getContextPath(context: unknown): string | null {
  if (typeof context !== "object" || context === null) {
    return null;
  }
  const value = (context as { path?: unknown }).path;
  return typeof value === "string" ? value : null;
}

function getRequestPath(context: unknown): string | null {
  if (typeof context !== "object" || context === null) {
    return null;
  }

  const request = (context as { request?: unknown }).request;
  if (!(request instanceof Request)) {
    return null;
  }

  try {
    return new URL(request.url).pathname;
  } catch {
    return null;
  }
}

function isSignUpContext(context: unknown): boolean {
  const contextPath = getContextPath(context);
  if (contextPath === SIGN_UP_PATH) {
    return true;
  }

  const requestPath = getRequestPath(context);
  return requestPath?.endsWith(SIGN_UP_PATH) === true;
}

function getInvitationKey(context: unknown): string | null {
  if (typeof context !== "object" || context === null) {
    return null;
  }
  const body = (context as { body?: unknown }).body;
  if (typeof body !== "object" || body === null) {
    return null;
  }
  const key = (body as { invitationKey?: unknown }).invitationKey;
  return typeof key === "string" && key.trim().length > 0 ? key.trim() : null;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          if (!isSignUpContext(context)) {
            return { data: user };
          }

          const userCount = await prisma.user.count();
          if (userCount > 0) {
            throw APIError.from("FORBIDDEN", {
              code: "SIGN_UP_CLOSED",
              message: "L'inscription est fermee. Un utilisateur existe deja.",
            });
          }

          const expectedInvitationKey = process.env.INVITATION_KEY?.trim();
          if (!expectedInvitationKey) {
            throw APIError.from("INTERNAL_SERVER_ERROR", {
              code: "INVITATION_KEY_NOT_CONFIGURED",
              message: "La cle d'invitation n'est pas configuree.",
            });
          }

          const providedInvitationKey = getInvitationKey(context);
          if (!providedInvitationKey || providedInvitationKey !== expectedInvitationKey) {
            throw APIError.from("FORBIDDEN", {
              code: "INVALID_INVITATION_KEY",
              message: "Cle d'invitation invalide.",
            });
          }

          return { data: user };
        },
      },
    },
  },
});
