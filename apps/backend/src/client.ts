/**
 * Frontend-Safe API Exports
 *
 * This file contains ONLY browser-compatible exports from the backend package.
 * Frontend applications (apps/web, apps/admin, apps/mobile) MUST import from this file.
 *
 * CRITICAL RULES:
 *
 * ✅ ALLOWED:
 * - Type-only exports (export type \{ ... \})
 * - Pure TypeScript types and interfaces
 * - Constant arrays (export const ARRAY = [...] as const)
 * - Re-exports from /shared (browser-safe)
 * - tRPC router types (AppRouter, RouterInput, RouterOutput)
 * - Enum VALUES ONLY (not Zod schemas)
 *
 * ❌ FORBIDDEN:
 * - Zod schema objects (createPostSchema, updatePostSchema, etc.)
 * - Database table definitions (posts, users, etc.)
 * - Anything that imports 'postgres' or Node.js-specific modules
 * - Server-only code or validation logic
 * - Direct imports from features that contain Zod schemas
 * - The database instance (db)
 * - Server context or middleware
 *
 * WHY THIS EXISTS:
 * The main index.ts imports the database instance and server code that transitively
 * imports Node.js modules (cors, standalone server, etc.), which breaks browser builds.
 * Frontend only needs types and constants - not server runtime code, validation schemas,
 * or database logic.
 *
 * FRONTEND USAGE:
 * ```typescript
 * // ✅ CORRECT: Import from client
 * import type { AppRouter, RouterInput, RouterOutput } from '@project/backend/client';
 * import { POST_STATUSES } from '@project/backend/client';
 *
 * // ❌ WRONG: Import from main export (pulls in server code)
 * import type { AppRouter } from '@project/backend'; // ❌ This will break!
 * ```
 */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './router';

// Export tRPC router type
export type { AppRouter } from './router';

// Export type helpers for inferring input/output types from the router
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;

// Export pagination types
export type { PageInfo, PaginatedResponse } from './shared/pagination.types';

// Export enum VALUES from shared (browser-safe)
// NOTE: Do NOT export enum TYPES - frontend should infer them from tRPC RouterOutput
export { POST_STATUSES } from '@project/shared/types';
