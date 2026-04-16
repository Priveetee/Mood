import prisma from "@/lib/prisma";
import { procedure, router } from "../trpc";

export const authRouter = router({
  canRegister: procedure.query(async () => {
    const userCount = await prisma.user.count();
    return { canRegister: userCount === 0 };
  }),
});
