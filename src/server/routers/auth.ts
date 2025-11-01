import { procedure, router } from "../trpc";
import prisma from "@/lib/prisma";

export const authRouter = router({
  canRegister: procedure.query(async () => {
    const userCount = await prisma.user.count();
    return { canRegister: userCount === 0 };
  }),
});
