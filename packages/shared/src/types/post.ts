/**
 * Post-related types
 * Single source of truth for post status VALUES (array only)
 * The PostStatus TYPE is defined in /db schema and re-exported for convenience
 */

export const POST_STATUSES = ['draft', 'published'] as const;
