import { describe, it, expect } from 'vitest';
import { db, posts } from '@project/db';
import { eq } from 'drizzle-orm';
import {
  createTestCaller,
  createTestAuditContext,
} from '../../__tests__/utils/test-caller';
import { runWithAuditContext } from '../../shared/audit-context-storage';

const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('Posts Router Integration Tests', () => {
  // Note: Database cleanup is handled by global setup.ts resetDatabase()

  describe('posts.list', () => {
    it('should return empty list when no posts exist', async () => {
      const caller = createTestCaller();
      const result = await caller.posts.list({ pageSize: 10 });

      expect(result.items).toEqual([]);
      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.pageInfo.hasPreviousPage).toBe(false);
    });

    it('should return paginated posts', async () => {
      const caller = createTestCaller();
      const auditContext = createTestAuditContext(TEST_USER_ID);

      // Create test posts
      await runWithAuditContext(auditContext, () =>
        caller.posts.create({
          title: 'Post 1',
          content: 'Content 1',
          slug: 'post-1',
          status: 'published',
          publishedAt: new Date(),
        })
      );
      await runWithAuditContext(auditContext, () =>
        caller.posts.create({
          title: 'Post 2',
          content: 'Content 2',
          slug: 'post-2',
          status: 'published',
          publishedAt: new Date(),
        })
      );
      await runWithAuditContext(auditContext, () =>
        caller.posts.create({
          title: 'Post 3',
          content: 'Content 3',
          slug: 'post-3',
          status: 'draft',
        })
      );

      const result = await caller.posts.list({ pageSize: 10 });

      expect(result.items).toHaveLength(3);
      expect(result.pageInfo.hasNextPage).toBe(false);
      expect(result.pageInfo.hasPreviousPage).toBe(false);
    });

    it('should filter by status', async () => {
      const caller = createTestCaller();

      // Create test posts with different statuses
      await caller.posts.create({
        title: 'Published Post',
        content: 'Content',
        slug: 'published-post',
        status: 'published',
        publishedAt: new Date(),
      });
      await caller.posts.create({
        title: 'Draft Post',
        content: 'Content',
        slug: 'draft-post',
        status: 'draft',
      });

      // Filter by published status
      const publishedResult = await caller.posts.list({
        pageSize: 10,
        status: 'published',
      });

      expect(publishedResult.items).toHaveLength(1);
      expect(publishedResult.items[0]?.status).toBe('published');

      // Filter by draft status
      const draftResult = await caller.posts.list({
        pageSize: 10,
        status: 'draft',
      });

      expect(draftResult.items).toHaveLength(1);
      expect(draftResult.items[0]?.status).toBe('draft');
    });

    it('should filter by search query', async () => {
      const caller = createTestCaller();

      // Create test posts
      await caller.posts.create({
        title: 'JavaScript Tutorial',
        content: 'Learn JavaScript',
        slug: 'javascript-tutorial',
        status: 'published',
        publishedAt: new Date(),
      });
      await caller.posts.create({
        title: 'TypeScript Guide',
        content: 'Learn TypeScript',
        slug: 'typescript-guide',
        status: 'published',
        publishedAt: new Date(),
      });

      // Search for "JavaScript"
      const result = await caller.posts.list({
        pageSize: 10,
        search: 'JavaScript',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.title).toContain('JavaScript');
    });

    it('should support pagination with cursors', async () => {
      const caller = createTestCaller();

      // Create multiple posts with explicit different timestamps
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
      for (let i = 1; i <= 5; i++) {
        await caller.posts.create({
          title: `Post ${i.toString()}`,
          content: `Content ${i.toString()}`,
          slug: `post-${i.toString()}`,
          status: 'published',
          publishedAt: new Date(baseTime + i * 60000), // 1 minute apart
        });
      }

      // Get first page - explicitly sort by publishedAt since we set different values
      const firstPage = await caller.posts.list({
        pageSize: 2,
        sort: { column: 'publishedAt', direction: 'desc' },
      });

      expect(firstPage.items).toHaveLength(2);
      expect(firstPage.pageInfo.hasNextPage).toBe(true);
      expect(firstPage.pageInfo.hasPreviousPage).toBe(false);
      expect(firstPage.pageInfo.endCursor).not.toBeNull();

      // Get second page using cursor
      const secondPage = await caller.posts.list({
        pageSize: 2,
        cursor: firstPage.pageInfo.endCursor ?? undefined,
        sort: { column: 'publishedAt', direction: 'desc' },
      });

      expect(secondPage.items).toHaveLength(2);
      expect(secondPage.pageInfo.hasNextPage).toBe(true);
    });

    it('should support backward pagination', async () => {
      const caller = createTestCaller();

      // Create multiple posts with explicit different timestamps
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
      for (let i = 1; i <= 5; i++) {
        await caller.posts.create({
          title: `Post ${i.toString()}`,
          content: `Content ${i.toString()}`,
          slug: `post-${i.toString()}`,
          status: 'published',
          publishedAt: new Date(baseTime + i * 60000), // 1 minute apart
        });
      }

      // Get first page - explicitly sort by publishedAt since we set different values
      const firstPage = await caller.posts.list({
        pageSize: 2,
        sort: { column: 'publishedAt', direction: 'desc' },
      });

      // Get second page
      const secondPage = await caller.posts.list({
        pageSize: 2,
        cursor: firstPage.pageInfo.endCursor ?? undefined,
        sort: { column: 'publishedAt', direction: 'desc' },
        direction: 'forward',
      });

      // Go back to first page
      if (secondPage.pageInfo.startCursor) {
        const backToFirst = await caller.posts.list({
          pageSize: 2,
          cursor: secondPage.pageInfo.startCursor,
          sort: { column: 'publishedAt', direction: 'desc' },
          direction: 'backward',
        });

        expect(backToFirst.items).toHaveLength(2);
        expect(backToFirst.pageInfo.hasPreviousPage).toBe(false);
      }
    });

    it('should sort by createdAt ascending', async () => {
      const caller = createTestCaller();

      // Create posts with different timestamps
      await caller.posts.create({
        title: 'Post 1',
        content: 'Content 1',
        slug: 'post-1',
        status: 'published',
        publishedAt: new Date('2024-01-01'),
      });
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
      await caller.posts.create({
        title: 'Post 2',
        content: 'Content 2',
        slug: 'post-2',
        status: 'published',
        publishedAt: new Date('2024-01-02'),
      });
      const result = await caller.posts.list({
        pageSize: 10,
        sort: { column: 'createdAt', direction: 'asc' },
      });

      expect(result.items).toHaveLength(2);
      expect(
        new Date(result.items[0]?.createdAt ?? Date.now()).getTime()
      ).toBeLessThanOrEqual(
        new Date(result.items[1]?.createdAt ?? Date.now()).getTime()
      );
    });

    it('should sort by title', async () => {
      const caller = createTestCaller();

      // Create posts with different titles
      await caller.posts.create({
        title: 'Zebra',
        content: 'Content',
        slug: 'zebra',
        status: 'published',
        publishedAt: new Date(),
      });
      await caller.posts.create({
        title: 'Apple',
        content: 'Content',
        slug: 'apple',
        status: 'published',
        publishedAt: new Date(),
      });
      const result = await caller.posts.list({
        pageSize: 10,
        sort: { column: 'title', direction: 'asc' },
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.title).toBe('Apple');
      expect(result.items[1]?.title).toBe('Zebra');
    });

    it('should sort by status', async () => {
      const caller = createTestCaller();

      // Create posts with different statuses
      await caller.posts.create({
        title: 'Published',
        content: 'Content',
        slug: 'published',
        status: 'published',
        publishedAt: new Date(),
      });
      await caller.posts.create({
        title: 'Draft',
        content: 'Content',
        slug: 'draft',
        status: 'draft',
      });
      const result = await caller.posts.list({
        pageSize: 10,
        sort: { column: 'status', direction: 'asc' },
      });

      expect(result.items).toHaveLength(2);
      // "draft" comes before "published" alphabetically
      expect(result.items[0]?.status).toBe('draft');
      expect(result.items[1]?.status).toBe('published');
    });
  });

  describe('posts.get', () => {
    it('should return post by id', async () => {
      const caller = createTestCaller();

      // Create a test post
      const post = await caller.posts.create({
        title: 'Test Post',
        content: 'Test Content',
        slug: 'test-post',
        status: 'published',
        publishedAt: new Date(),
      });
      const result = await caller.posts.get({ id: post.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(post.id);
      expect(result.title).toBe('Test Post');
      expect(result.slug).toBe('test-post');
    });

    it('should throw NOT_FOUND error when post does not exist', async () => {
      const caller = createTestCaller();
      await expect(
        caller.posts.get({ id: '00000000-0000-0000-0000-000000000000' })
      ).rejects.toThrow('Post not found');
    });
  });

  describe('posts.create', () => {
    it('should create post with audit columns', async () => {
      const caller = createTestCaller();
      const auditContext = createTestAuditContext(TEST_USER_ID);
      const result = await runWithAuditContext(auditContext, () =>
        caller.posts.create({
          title: 'New Post',
          content: 'New Content',
          slug: 'new-post',
          status: 'draft',
        })
      );

      expect(result).toBeDefined();
      expect(result.title).toBe('New Post');
      expect(result.content).toBe('New Content');
      expect(result.slug).toBe('new-post');
      expect(result.status).toBe('draft');

      // Verify audit columns
      expect(result.createdBy).toBe(TEST_USER_ID);
      expect(result.updatedBy).toBe(TEST_USER_ID);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Verify in database
      const [dbPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, result.id))
        .limit(1);

      expect(dbPost).toBeDefined();
      expect(dbPost?.createdBy).toBe(TEST_USER_ID);
      expect(dbPost?.updatedBy).toBe(TEST_USER_ID);
    });

    it('should create post with default status draft', async () => {
      const caller = createTestCaller();
      const result = await caller.posts.create({
        title: 'New Post',
        content: 'New Content',
        slug: 'new-post-2',
      });

      expect(result.status).toBe('draft');
    });

    it('should create post with published status', async () => {
      const caller = createTestCaller();
      const result = await caller.posts.create({
        title: 'Published Post',
        content: 'Published Content',
        slug: 'published-post',
        status: 'published',
        publishedAt: new Date(),
      });

      expect(result.status).toBe('published');
      expect(result.publishedAt).toBeInstanceOf(Date);
    });

    it('should reject duplicate slug', async () => {
      // Create first post
      const caller = createTestCaller();
      await caller.posts.create({
        title: 'First Post',
        content: 'First Content',
        slug: 'duplicate-slug',
      });

      // Try to create second post with same slug
      await expect(
        caller.posts.create({
          title: 'Second Post',
          content: 'Second Content',
          slug: 'duplicate-slug',
        })
      ).rejects.toThrow('slug already exists');
    });

    it('should validate required fields', async () => {
      const caller = createTestCaller();
      // Missing title
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Testing invalid input requires bypassing type checking
        caller.posts.create({
          content: 'Content',
          slug: 'test',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing invalid input requires type assertion
        } as any)
      ).rejects.toThrow();

      // Missing content
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Testing invalid input requires bypassing type checking
        caller.posts.create({
          title: 'Title',
          slug: 'test',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing invalid input requires type assertion
        } as any)
      ).rejects.toThrow();

      // Missing slug
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Testing invalid input requires bypassing type checking
        caller.posts.create({
          title: 'Title',
          content: 'Content',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Testing invalid input requires type assertion
        } as any)
      ).rejects.toThrow();
    });

    it('should validate slug format', async () => {
      const caller = createTestCaller();
      // Invalid slug with uppercase
      await expect(
        caller.posts.create({
          title: 'Test',
          content: 'Content',
          slug: 'Invalid-Slug',
        })
      ).rejects.toThrow();

      // Invalid slug with spaces
      await expect(
        caller.posts.create({
          title: 'Test',
          content: 'Content',
          slug: 'invalid slug',
        })
      ).rejects.toThrow();

      // Invalid slug with special characters
      await expect(
        caller.posts.create({
          title: 'Test',
          content: 'Content',
          slug: 'invalid@slug',
        })
      ).rejects.toThrow();
    });

    it('should create post with system audit context', async () => {
      const caller = createTestCaller();
      const result = await caller.posts.create({
        title: 'System Post',
        content: 'System Content',
        slug: 'system-post',
      });

      expect(result.createdBy).toBeNull();
      expect(result.updatedBy).toBeNull();
    });
  });

  describe('posts.update', () => {
    it('should update post and audit columns', async () => {
      const userId1 = '550e8400-e29b-41d4-a716-446655440001';
      const userId2 = '550e8400-e29b-41d4-a716-446655440002';

      // Create post with user 1
      const caller = createTestCaller();
      const auditContext1 = createTestAuditContext(userId1);
      const post = await runWithAuditContext(auditContext1, () =>
        caller.posts.create({
          title: 'Original Title',
          content: 'Original Content',
          slug: 'original-slug',
        })
      );

      expect(post.createdBy).toBe(userId1);
      expect(post.updatedBy).toBe(userId1);

      // Small delay to ensure different timestamp
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Update post with user 2
      const auditContext2 = createTestAuditContext(userId2);
      const updated = await runWithAuditContext(auditContext2, () =>
        caller.posts.update({
          id: post.id,
          data: {
            title: 'Updated Title',
            content: 'Updated Content',
          },
        })
      );

      expect(updated.title).toBe('Updated Title');
      expect(updated.content).toBe('Updated Content');
      expect(updated.slug).toBe('original-slug'); // slug not changed

      // Verify audit columns
      expect(updated.createdBy).toBe(userId1); // Original creator
      expect(updated.updatedBy).toBe(userId2); // New updater
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(post.updatedAt).getTime()
      );
    });

    it('should update only provided fields', async () => {
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Original Title',
        content: 'Original Content',
        slug: 'original-slug',
      });

      // Update only title
      const updated = await caller.posts.update({
        id: post.id,
        data: {
          title: 'New Title',
        },
      });

      expect(updated.title).toBe('New Title');
      expect(updated.content).toBe('Original Content');
      expect(updated.slug).toBe('original-slug');
    });

    it('should update slug', async () => {
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Test',
        content: 'Content',
        slug: 'old-slug',
      });

      const updated = await caller.posts.update({
        id: post.id,
        data: {
          slug: 'new-slug',
        },
      });

      expect(updated.slug).toBe('new-slug');
    });

    it('should update status', async () => {
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Test',
        content: 'Content',
        slug: 'test-slug',
        status: 'draft',
      });

      expect(post.status).toBe('draft');

      const updated = await caller.posts.update({
        id: post.id,
        data: {
          status: 'published',
        },
      });

      expect(updated.status).toBe('published');
    });

    it('should update publishedAt', async () => {
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Test',
        content: 'Content',
        slug: 'test-slug',
        status: 'draft',
      });

      expect(post.publishedAt).toBeNull();

      const publishDate = new Date('2024-01-01');
      const updated = await caller.posts.update({
        id: post.id,
        data: {
          publishedAt: publishDate,
        },
      });

      expect(updated.publishedAt).toBeInstanceOf(Date);
    });

    it('should set publishedAt to null', async () => {
      const publishDate = new Date();
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Test',
        content: 'Content',
        slug: 'test-slug',
        status: 'published',
        publishedAt: publishDate,
      });

      expect(post.publishedAt).not.toBeNull();

      const updated = await caller.posts.update({
        id: post.id,
        data: {
          publishedAt: null,
        },
      });

      expect(updated.publishedAt).toBeNull();
    });

    it('should reject duplicate slug on update', async () => {
      // Create two posts
      const caller = createTestCaller();
      const post1 = await caller.posts.create({
        title: 'Post 1',
        content: 'Content 1',
        slug: 'post-1',
      });

      await caller.posts.create({
        title: 'Post 2',
        content: 'Content 2',
        slug: 'post-2',
      });

      // Try to update post1 slug to post2's slug
      await expect(
        caller.posts.update({
          id: post1.id,
          data: {
            slug: 'post-2',
          },
        })
      ).rejects.toThrow('slug already exists');
    });

    it('should allow updating slug to same value', async () => {
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Test',
        content: 'Content',
        slug: 'test-slug',
      });

      // Update with same slug should work
      const updated = await caller.posts.update({
        id: post.id,
        data: {
          slug: 'test-slug',
          title: 'Updated Title',
        },
      });

      expect(updated.slug).toBe('test-slug');
      expect(updated.title).toBe('Updated Title');
    });

    it('should throw NOT_FOUND error when updating non-existent post', async () => {
      const caller = createTestCaller();
      await expect(
        caller.posts.update({
          id: '00000000-0000-0000-0000-000000000000',
          data: {
            title: 'Updated',
          },
        })
      ).rejects.toThrow('Post not found');
    });

    it('should validate slug format on update', async () => {
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Test',
        content: 'Content',
        slug: 'valid-slug',
      });

      // Invalid slug format
      await expect(
        caller.posts.update({
          id: post.id,
          data: {
            slug: 'Invalid-Slug',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('posts.delete', () => {
    it('should delete post', async () => {
      // Create a post
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'To Delete',
        content: 'Content',
        slug: 'to-delete',
      });

      // Delete the post
      const result = await caller.posts.delete({ id: post.id });

      expect(result.success).toBe(true);

      // Verify post is deleted
      const [deletedPost] = await db
        .select()
        .from(posts)
        .where(eq(posts.id, post.id))
        .limit(1);

      expect(deletedPost).toBeUndefined();
    });

    it('should handle deleting non-existent post gracefully', async () => {
      // Deleting non-existent post should not throw error
      const caller = createTestCaller();
      const result = await caller.posts.delete({
        id: '00000000-0000-0000-0000-000000000000',
      });

      expect(result.success).toBe(true);
    });

    it('should allow creating post with same slug after deletion', async () => {
      // Create and delete a post
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Original',
        content: 'Content',
        slug: 'reusable-slug',
      });

      await caller.posts.delete({ id: post.id });

      // Create new post with same slug
      const newPost = await caller.posts.create({
        title: 'New Post',
        content: 'New Content',
        slug: 'reusable-slug',
      });

      expect(newPost.slug).toBe('reusable-slug');
      expect(newPost.id).not.toBe(post.id);
    });
  });

  describe('complex scenarios', () => {
    it('should handle multiple filters and sorting together', async () => {
      const caller = createTestCaller();

      // Create diverse set of posts
      await caller.posts.create({
        title: 'JavaScript Basics',
        content: 'Learn JavaScript fundamentals',
        slug: 'js-basics',
        status: 'published',
        publishedAt: new Date(),
      });
      await caller.posts.create({
        title: 'TypeScript Advanced',
        content: 'Advanced TypeScript patterns',
        slug: 'ts-advanced',
        status: 'draft',
      });
      await caller.posts.create({
        title: 'JavaScript Advanced',
        content: 'Advanced JavaScript techniques',
        slug: 'js-advanced',
        status: 'published',
        publishedAt: new Date(),
      });

      // Search for "JavaScript" + filter by "published" + sort by title
      const result = await caller.posts.list({
        pageSize: 10,
        search: 'JavaScript',
        status: 'published',
        sort: { column: 'title', direction: 'asc' },
      });

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.title).toBe('JavaScript Advanced');
      expect(result.items[1]?.title).toBe('JavaScript Basics');
      expect(result.items.every((post) => post.status === 'published')).toBe(
        true
      );
    });

    it('should handle concurrent updates correctly', async () => {
      // Create a post
      const caller = createTestCaller();
      const post = await caller.posts.create({
        title: 'Original',
        content: 'Original Content',
        slug: 'concurrent-test',
      });

      // Simulate concurrent updates
      const [update1, update2] = await Promise.all([
        caller.posts.update({
          id: post.id,
          data: { title: 'Updated by User 1' },
        }),
        caller.posts.update({
          id: post.id,
          data: { content: 'Updated by User 2' },
        }),
      ]);

      // Both updates should succeed
      expect(update1).toBeDefined();
      expect(update2).toBeDefined();

      // Get final state
      const final = await caller.posts.get({ id: post.id });

      // One of the updates should be reflected
      expect(final).toBeDefined();
    });

    it('should maintain data integrity across create, update, and list operations', async () => {
      // Create a post
      const caller = createTestCaller();
      const auditContext = createTestAuditContext(TEST_USER_ID);
      const created = await runWithAuditContext(auditContext, () =>
        caller.posts.create({
          title: 'Integrity Test',
          content: 'Test Content',
          slug: 'integrity-test',
          status: 'draft',
        })
      );

      // Update it
      await runWithAuditContext(auditContext, () =>
        caller.posts.update({
          id: created.id,
          data: {
            status: 'published',
            publishedAt: new Date(),
          },
        })
      );

      // List and find it
      const list = await caller.posts.list({
        pageSize: 10,
        status: 'published',
      });

      const foundInList = list.items.find((p) => p.id === created.id);
      expect(foundInList).toBeDefined();
      expect(foundInList?.status).toBe('published');

      // Get it directly
      const retrieved = await caller.posts.get({ id: created.id });

      expect(retrieved.status).toBe('published');
      expect(retrieved.title).toBe(created.title);
      expect(retrieved.createdBy).toBe(TEST_USER_ID);
      expect(retrieved.updatedBy).toBe(TEST_USER_ID);
    });
  });
});
