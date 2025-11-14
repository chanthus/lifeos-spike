import { db, type AuditContext, createAuditableDb } from '@project/db';
import { createDIContainer } from './container.impl';
import type { DIContainer } from './container';

export function createTestContainer(): DIContainer {
  return createDIContainer(db);
}

export function createTestAuditContext(
  userId: string | null = null
): AuditContext {
  return {
    userId,
    isSystemOperation: userId === null,
  };
}

export { createAuditableDb };
