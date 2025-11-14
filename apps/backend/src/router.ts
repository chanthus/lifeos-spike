import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { router } from './trpc';
import { postsRouter } from './features/posts/posts.router';

/**
 * Main application router
 * Combines all feature routers
 */
export const appRouter = router({
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Type helpers for inferring input/output types from the router
 * Used by frontend apps to infer types from tRPC endpoints
 */
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
