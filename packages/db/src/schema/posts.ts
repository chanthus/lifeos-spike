import {
  pgTable,
  text,
  uuid,
  pgEnum,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { POST_STATUSES } from '@project/shared';
import { auditColumns } from './audit';

// Single source of truth for VALUES is in /shared/types
// Type is inferred from the enum here
export const postStatusEnum = pgEnum('post_status', POST_STATUSES);

// Infer and export the PostStatus type from the enum
export type PostStatus = (typeof postStatusEnum.enumValues)[number];

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    slug: text('slug').notNull(),
    status: postStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at'),
    ...auditColumns,
  },
  (table) => ({
    slugIdx: unique('posts_slug_unique').on(table.slug),
    statusIdx: index('posts_status_idx').on(table.status),
    createdByIdx: index('posts_created_by_idx').on(table.createdBy),
    updatedByIdx: index('posts_updated_by_idx').on(table.updatedBy),
  })
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
