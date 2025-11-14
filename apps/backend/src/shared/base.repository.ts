import type { Database, AuditableDatabase } from '@project/db';
import { createAuditableDb } from '@project/db';
import { requireAuditContext } from './audit-context-storage';

export abstract class BaseRepository {
  constructor(protected db: Database) {}

  protected get auditDb(): AuditableDatabase {
    return createAuditableDb(this.db, requireAuditContext());
  }

  protected getAuditableDb(tx?: Database): AuditableDatabase {
    if (tx) {
      return createAuditableDb(tx, requireAuditContext());
    }
    return this.auditDb;
  }
}
