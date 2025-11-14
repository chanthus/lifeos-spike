import { serve } from '@hono/node-server';
import { app } from './app';
import 'dotenv/config';

/**
 * Local Development Server Entry Point
 *
 * IMPORTANT: Frontend apps should NOT import from this file.
 * Use '\@project/backend/client' instead for frontend-safe exports.
 * This file contains server-only code that won't work in browsers.
 *
 * For Vercel deployment, the root index.ts is used instead.
 */

const PORT = Number(process.env.PORT || process.env.BACKEND_PORT || 43895);

/**
 * Start Node.js server (local development only)
 * nodemon will handle restarting the process on file changes
 */
const server = serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(
      `🚀 Backend server running on http://localhost:${String(info.port)}`
    );
    console.log(`📡 tRPC endpoint: http://localhost:${String(info.port)}/trpc`);
  }
);

/**
 * Graceful shutdown handler
 * Ensures server closes properly when process terminates
 */
const shutdown = (signal: string): void => {
  console.log(`\n👋 Received ${signal}, shutting down server...`);
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  shutdown('SIGINT');
});

// eslint-disable-next-line import/no-default-export -- Entry point file needs default export for Vercel
export default app;
