// import { postRouter } from "@/server/api/routers/post";
import { productRouter } from "@/server/api/routers/product";
import { cashLogRouter } from "@/server/api/routers/cashLog";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { promotionRouter } from "@/server/api/routers/promotion";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // post: postRouter,
  product: productRouter,
  cashLog: cashLogRouter,
  promotion: promotionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
