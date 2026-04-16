import { nanoid } from "nanoid";
import { z } from "zod";
import { createCampaign } from "@/server/modules/campaign/create";
import {
  addCampaignManager,
  getCampaignLinks,
  setCampaignArchiveStatus,
} from "@/server/modules/campaign/links";
import { listCampaigns } from "@/server/modules/campaign/list";
import { protectedProcedure, router } from "../trpc";

export const campaignRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return listCampaigns({
      prisma: ctx.prisma,
      userId: ctx.session.user.id,
    });
  }),

  getLinks: protectedProcedure.input(z.number()).query(async ({ ctx, input: campaignId }) =>
    getCampaignLinks({
      prisma: ctx.prisma,
      campaignId,
      userId: ctx.session.user.id,
      request: ctx.req,
    }),
  ),

  addManager: protectedProcedure
    .input(z.object({ campaignId: z.number(), managerName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return addCampaignManager({
        prisma: ctx.prisma,
        campaignId: input.campaignId,
        managerName: input.managerName.trim(),
        userId: ctx.session.user.id,
        token: nanoid(10),
        request: ctx.req,
      });
    }),

  setArchiveStatus: protectedProcedure
    .input(z.object({ campaignId: z.number(), archived: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return setCampaignArchiveStatus(
        ctx.prisma,
        input.campaignId,
        input.archived,
        ctx.session.user.id,
      );
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        managers: z.array(z.string().min(1)),
        expiresAt: z.date().optional(),
        commentsRequired: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      createCampaign({
        prisma: ctx.prisma,
        input,
        userId: ctx.session.user.id,
        request: ctx.req,
      }),
    ),
});
