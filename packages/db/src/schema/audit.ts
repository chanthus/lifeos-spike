import { timestamp, uuid } from 'drizzle-orm/pg-core';

export const timestampAuditColumns = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

/**
 * User audit columns for tracking who created/updated records.
 * These columns are nullable to support system operations (e.g., automated processes, migrations, OAuth flows)
 * that may not have an authenticated user context at the time of creation/update.
 *
 * Note: Add foreign key references manually in each table schema that uses these columns.
 */
export const userAuditColumns = {
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
};

export const auditColumns = {
  ...timestampAuditColumns,
  ...userAuditColumns,
};

export interface TimestampAudit {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAudit {
  createdBy: string | null;
  updatedBy: string | null;
}

export interface FullAudit extends TimestampAudit, UserAudit {}

export function extractAuditFields<T extends Record<string, unknown>>(
  data: T
): Omit<T, 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'> {
  const {
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    createdBy: _createdBy,
    updatedBy: _updatedBy,
    ...rest
  } = data;
  return rest;
}
