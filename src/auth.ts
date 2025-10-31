import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    password: {
      verify: async ({ hash, password: plain }) => {
        return bcrypt.compare(plain, hash);
      },
    },
  },
});
