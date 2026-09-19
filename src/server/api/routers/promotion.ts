// src/server/api/routers/promotion.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const promotionRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.promotion.findMany(); // Adjust depending on your Prisma client setup
  }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        targetSkuPattern: z.string(),
        requiredQty: z.number(),
        bundlePrice: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.promotion.create({
        data: input,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.promotion.delete({
        where: { id: input.id },
      });
    }),
});