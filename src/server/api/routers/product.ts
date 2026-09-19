// src/server/api/routers/product.ts
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        costPrice: true,
        price: true,
        stockQty: true,
        unitType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Product name is required"),
        sku: z.string().min(1, "SKU is required"),
        category: z.string().default("Product"),
        costPrice: z.number().min(0, "Cost price cannot be negative").default(0), // Made optional with default 0
        price: z.number().positive("Sell price must be greater than 0"),
        stockQty: z.number().min(0, "Stock cannot be negative"),
        unitType: z.string().default("UNITS"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.create({
        data: {
          name: input.name,
          sku: input.sku,
          category: input.category,
          costPrice: input.costPrice,
          price: input.price,
          stockQty: input.stockQty,
          unitType: input.unitType,
        },
      });
    }),

  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        sku: z.string().min(1),
        category: z.string(),
        costPrice: z.number().min(0).default(0), // Made optional with default 0
        price: z.number().positive(),
        stockQty: z.number().min(0),
        unitType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.update({
        where: { id: input.id },
        data: {
          name: input.name,
          sku: input.sku,
          category: input.category,
          costPrice: input.costPrice,
          price: input.price,
          stockQty: input.stockQty,
          unitType: input.unitType,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.delete({
        where: { id: input.id },
      });
    }),
    

  updateStock: publicProcedure
    .input(
      z.object({
        id: z.string(),
        stockQty: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.product.update({
        where: { id: input.id },
        data: { stockQty: input.stockQty },
      });
    }),
});