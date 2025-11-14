import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { db } from '@project/db';
import { appRouter } from './router';
import { createContext } from './context';

/**
 * Create Hono app (platform-agnostic)
 * This app can be used with Node.js server, Cloudflare Workers, or other platforms
 */
const app = new Hono();

/**
 * CORS middleware
 */
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

/**
 * tRPC endpoint handler
 */
app.all('/trpc/*', async (c) => {
  return fetchRequestHandler({
    endpoint: '/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => createContext(db),
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

/**
 * Root endpoint
 */
app.get('/', (c) => {
  return c.json({
    message: 'Backend API',
    endpoints: {
      trpc: '/trpc',
      health: '/health',
    },
  });
});

export { app };
