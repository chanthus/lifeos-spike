import { z } from 'zod';
import {
  MIN_PAGE_SIZE,
  MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
} from './pagination.constants';

export const paginationDirectionSchema = z
  .enum(['forward', 'backward'])
  .optional()
  .default('forward');

export const basePaginationInputSchema = z.object({
  cursor: z.string().optional(),
  pageSize: z
    .number()
    .int()
    .min(MIN_PAGE_SIZE)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  direction: paginationDirectionSchema,
});

export const createPaginationSortSchema = <T extends string>(
  columns: readonly T[]
): z.ZodOptional<
  z.ZodObject<{
    column: z.ZodEnum<[T, ...T[]]>;
    direction: z.ZodDefault<z.ZodEnum<['asc', 'desc']>>;
  }>
> =>
  z
    .object({
      column: z.enum(columns as [T, ...T[]]),
      direction: z.enum(['asc', 'desc']).default('desc'),
    })
    .optional();

export const pageInfoSchema = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  startCursor: z.string().nullable(),
  endCursor: z.string().nullable(),
});
