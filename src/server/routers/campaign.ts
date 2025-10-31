import { z } from "zod";
import { nanoid } from "nanoid";
import { router, procedure } from "../trpc";

export const campaignRouter = router({
  create: procedure
    .input(
      z.object({
        name: z.string().min(1),
        managers: z.array(z.string().min(1)),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("Not authenticated");
      }

      const campaign = await ctx.prisma.campaign.create({
        data: {
          name: input.name,
          createdBy: ctx.session.user.id,
          archived: false,
          expiresAt: input.expiresAt,
        },
      });

      const pollLinksData = input.managers.map((managerName: string) => ({
        campaignId: campaign.id,
        token: nanoid(10),
        managerName,
      }));

      await ctx.prisma.pollLink.createMany({
        data: pollLinksData,
      });

      const pollLinks = await ctx.prisma.pollLink.findMany({
        where: { campaignId: campaign.id },
      });

      const generatedLinks = pollLinks.map((link) => ({
        managerName: link.managerName,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/poll/${link.token}`,
      }));

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        generatedLinks,
      };
    }),
});
