import { initTRPC } from '@trpc/server';
import type { Database } from '@project/db';
import type { DIContainer } from './di/container';
import {
  runWithAuditContext,
  createSystemAuditContext,
  hasAuditContext,
} from './shared/audit-context-storage';

/**
 * Context for tRPC procedures in the backend
 */
export interface Context {
  db: Database;
  services: DIContainer['services'];
}

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create();

/**
 * Audit context middleware
 * Wraps all procedure calls with audit context using AsyncLocalStorage
 * If an audit context already exists (e.g., from tests), it will be preserved
 */
const auditContextMiddleware = t.middleware(async ({ next, ctx }) => {
  if (hasAuditContext()) {
    return next({ ctx });
  }

  const auditContext = createSystemAuditContext();
  return runWithAuditContext(auditContext, () => next({ ctx }));
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure.use(auditContextMiddleware);
export const middleware = t.middleware;
