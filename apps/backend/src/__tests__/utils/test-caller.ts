import type { AuditContext } from '@project/db';
import { db } from '@project/db';
import { appRouter } from '../../router';
import { createContext } from '../../context';

/**
 * Creates a tRPC caller for testing
 * Tests should wrap calls with runWithAuditContext() to populate createdBy/updatedBy fields
 */
export const createTestCaller = (): ReturnType<
  typeof appRouter.createCaller
> => {
  const ctx = createContext(db);
  return appRouter.createCaller(ctx);
};

/**
 * Creates an audit context for testing
 */
export const createTestAuditContext = (
  userId: string | null = null
): AuditContext => {
  return {
    userId,
  };
};
