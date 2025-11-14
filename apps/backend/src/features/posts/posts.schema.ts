import { z } from 'zod';
import {
  basePaginationInputSchema,
  createPaginationSortSchema,
} from '../../shared/pagination.schema';

const postSortColumns = [
  'createdAt',
  'title',
  'status',
  'publishedAt',
] as const;

export const listPostsSchema = z
  .object({
    ...basePaginationInputSchema.shape,
    sort: createPaginationSortSchema(postSortColumns),
    status: z.enum(['draft', 'published']).optional(),
    search: z.string().optional(),
  })
  .optional();

export const getPostSchema = z.object({
  id: z.string().uuid(),
});

export const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    ),
  status: z.enum(['draft', 'published']).default('draft'),
  publishedAt: z.date().optional(),
});

export const updatePostSchema = z.object({
  id: z.string().uuid(),
  data: z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional(),
    slug: z
      .string()
      .min(1)
      .max(255)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    status: z.enum(['draft', 'published']).optional(),
    publishedAt: z.date().optional().nullable(),
  }),
});

export const deletePostSchema = z.object({
  id: z.string().uuid(),
});

export type PostSortColumn = (typeof postSortColumns)[number];
