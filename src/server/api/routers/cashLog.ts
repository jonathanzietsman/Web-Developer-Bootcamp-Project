// src/server/api/routers/cashLog.ts
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const cashLogRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.cashLog.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      });
    } catch (error) {
      console.error("Failed to fetch cash logs:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve cash logs.",
      });
    }
  }),

  getSummary: protectedProcedure.query(async ({ ctx }) => {
    try {
      const logs = await ctx.db.cashLog.findMany();

      const summary = logs.reduce(
        (acc, log) => {
          if (log.method === "CARD") {
            if (log.type === "IN") {
              acc.totalCard += log.amount;
            } else if (log.type === "OUT") {
              acc.totalCardOut += log.amount;
              acc.totalCard -= log.amount; // Subtract refunds from net card payments
            }
          } else {
            // Cash transactions
            if (log.type === "IN") {
              acc.totalIn += log.amount;
              acc.balance += log.amount;
            } else if (log.type === "OUT") {
              acc.totalOut += log.amount;
              acc.balance -= log.amount;
            }
          }
          acc.grossTotal = acc.balance + acc.totalCard;
          return acc;
        },
        {
          balance: 0,
          totalIn: 0,
          totalOut: 0,
          totalCard: 0,
          totalCardOut: 0,
          grossTotal: 0,
        },
      );

      return summary;
    } catch (error) {
      console.error("Failed to calculate cash summary:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to compute cash summary drawer metrics.",
      });
    }
  }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.enum(["IN", "OUT"]),
        method: z.enum(["CASH", "CARD"]).default("CASH"),
        amount: z.number().positive("Amount must be greater than 0"),
        reason: z.string().min(1, "Reason is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const dbUser = await ctx.db.user.findUnique({
          where: { id: ctx.session.user.id },
        });

        if (!dbUser) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message:
              "Your session is stale or your user account was not found.",
          });
        }

        return await ctx.db.cashLog.create({
          data: {
            type: input.type,
            method: input.method,
            amount: input.amount,
            reason: input.reason,
            userId: ctx.session.user.id,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to record entry.",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.cashLog.delete({ where: { id: input.id } });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete log entry.",
        });
      }
    }),
});
