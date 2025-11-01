import { z } from "zod";
import { nanoid } from "nanoid";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const campaignRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    await ctx.prisma.campaign.updateMany({
      where: {
        createdBy: ctx.session.user.id,
        archived: false,
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        archived: true,
      },
    });

    const campaigns = await ctx.prisma.campaign.findMany({
      where: { createdBy: ctx.session.user.id },
      include: {
        _count: {
          select: {
            pollLinks: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedCampaigns = await Promise.all(
      campaigns.map(async (campaign) => {
        const totalPollLinks = campaign._count.pollLinks;
        const votedManagers = await ctx.prisma.vote.groupBy({
          by: ["pollLinkId"],
          where: { campaignId: campaign.id },
        });
        const votedManagersCount = votedManagers.length;
        const participationRate =
          totalPollLinks > 0
            ? Math.round((votedManagersCount / totalPollLinks) * 100)
            : 0;

        return {
          id: campaign.id,
          name: campaign.name,
          managerCount: totalPollLinks,
          creationDate: campaign.createdAt.toLocaleDateString("fr-FR"),
          participationRate,
          totalVotes: campaign._count.votes,
          archived: campaign.archived || false,
        };
      }),
    );
    return formattedCampaigns;
  }),

  getLinks: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input: campaignId }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: campaignId, createdBy: ctx.session.user.id },
        include: {
          pollLinks: {
            select: {
              id: true,
              managerName: true,
              token: true,
            },
            orderBy: { managerName: "asc" },
          },
        },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campagne introuvable",
        });
      }

      return campaign.pollLinks.map((link) => ({
        id: link.id,
        managerName: link.managerName,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/poll/${link.token}`,
      }));
    }),

  addManager: protectedProcedure
    .input(z.object({ campaignId: z.number(), managerName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId, createdBy: ctx.session.user.id },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campagne introuvable",
        });
      }

      const existingLink = await ctx.prisma.pollLink.findFirst({
        where: {
          campaignId: input.campaignId,
          managerName: input.managerName.trim(),
        },
      });

      if (existingLink) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ce manager existe déjà pour cette campagne",
        });
      }

      const newLink = await ctx.prisma.pollLink.create({
        data: {
          campaignId: input.campaignId,
          managerName: input.managerName.trim(),
          token: nanoid(10),
        },
      });

      return {
        id: newLink.id,
        managerName: newLink.managerName,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/poll/${newLink.token}`,
      };
    }),

  setArchiveStatus: protectedProcedure
    .input(z.object({ campaignId: z.number(), archived: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const campaign = await ctx.prisma.campaign.findUnique({
        where: { id: input.campaignId, createdBy: ctx.session.user.id },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campagne introuvable",
        });
      }

      const updatedCampaign = await ctx.prisma.campaign.update({
        where: { id: input.campaignId },
        data: { archived: input.archived },
      });

      return { success: true, archived: updatedCampaign.archived };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        managers: z.array(z.string().min(1)),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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
