import type { Database } from './client';

export interface AuditContext {
  userId: string | null;
  isSystemOperation?: boolean;
}

type DrizzleDb = Database;

export class AuditableDatabase {
  constructor(
    private db: DrizzleDb,
    private auditContext: AuditContext
  ) {}

  get select(): DrizzleDb['select'] {
    return this.db.select.bind(this.db);
  }

  get delete(): DrizzleDb['delete'] {
    return this.db.delete.bind(this.db);
  }

  get query(): DrizzleDb['query'] {
    return this.db.query;
  }

  get transaction(): DrizzleDb['transaction'] {
    return this.db.transaction.bind(this.db);
  }

  get $with(): DrizzleDb['$with'] {
    return this.db.$with.bind(this.db);
  }

  insert<T extends Parameters<DrizzleDb['insert']>[0]>(table: T) {
    type InsertType = T['$inferInsert'];

    return {
      values: (values: InsertType | InsertType[]) => {
        const now = new Date();
        const userId = this.auditContext.userId;

        const augmentValue = (value: Record<string, unknown>) => ({
          ...value,
          createdAt: value.createdAt ?? now,
          updatedAt: value.updatedAt ?? now,
          createdBy: value.createdBy ?? userId,
          updatedBy: value.updatedBy ?? userId,
        });

        const augmentedValues = Array.isArray(values)
          ? values.map(augmentValue)
          : augmentValue(values);

        // Type assertion is necessary here because we're dynamically adding audit fields.
        // Drizzle's type system expects exact schema types, but audit fields are added at runtime.
        // This is safe because audit columns are defined in the schema via auditColumns spread.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Type assertion needed for dynamic audit field injection
        return this.db.insert(table).values(augmentedValues as any);
      },
    };
  }

  update<T extends Parameters<DrizzleDb['update']>[0]>(table: T) {
    const originalUpdate = this.db.update(table);
    type OriginalSet = Parameters<typeof originalUpdate.set>[0];

    return {
      set: (values: OriginalSet) => {
        const now = new Date();
        const userId = this.auditContext.userId;

        // Type assertion is necessary because Drizzle's inferred types don't guarantee audit columns.
        // We cast to Record to safely access audit fields that we know exist via auditColumns spread.
        const valuesRecord = values as Record<string, unknown>;

        const augmentedValues = {
          ...values,
          updatedAt: valuesRecord.updatedAt ?? now,
          updatedBy: valuesRecord.updatedBy ?? userId,
        };

        // Type assertion is necessary here because we're dynamically adding audit fields.
        // Drizzle's type system expects exact schema types, but audit fields are added at runtime.
        // This is safe because audit columns are defined in the schema via auditColumns spread.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Type assertion needed for dynamic audit field injection
        return this.db.update(table).set(augmentedValues as any);
      },
    };
  }
}

export function createAuditableDb(
  db: DrizzleDb,
  auditContext: AuditContext
): AuditableDatabase {
  return new AuditableDatabase(db, auditContext);
}
