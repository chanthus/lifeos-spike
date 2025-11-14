import { AsyncLocalStorage } from 'node:async_hooks';
import type { AuditContext } from '@project/db';

const auditContextStorage = new AsyncLocalStorage<AuditContext>();

export function runWithAuditContext<T>(
  auditContext: AuditContext,
  callback: () => T | Promise<T>
): T | Promise<T> {
  return auditContextStorage.run(auditContext, callback);
}

export function getAuditContext(): AuditContext | undefined {
  return auditContextStorage.getStore();
}

export function requireAuditContext(): AuditContext {
  const context = auditContextStorage.getStore();
  if (!context) {
    throw new Error(
      'AuditContext not found. Ensure all database operations are wrapped with runWithAuditContext().'
    );
  }
  return context;
}

export function hasAuditContext(): boolean {
  return auditContextStorage.getStore() !== undefined;
}

export function createSystemAuditContext(): AuditContext {
  return {
    userId: null,
    isSystemOperation: true,
  };
}
