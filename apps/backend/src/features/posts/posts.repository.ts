import { posts, type Database, type PostStatus } from '@project/db';
import { eq, and, ilike, or, type SQL } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { BaseRepository } from '../../shared/base.repository';
import type {
  PaginatedResponse,
  PaginationInput,
} from '../../shared/pagination.types';
import { CursorCodec, CursorPagination } from '../../shared/pagination/cursor';
import type { PostSortColumn } from './posts.schema';

type Post = typeof posts.$inferSelect;
type NewPost = typeof posts.$inferInsert;

export class PostRepository extends BaseRepository {
  private readonly sortableColumns = {
    createdAt: posts.createdAt,
    title: posts.title,
    status: posts.status,
    publishedAt: posts.publishedAt,
  } as const;

  private readonly pagination: CursorPagination<typeof posts, Post>;

  constructor(db: Database) {
    super(db);
    const codec = new CursorCodec(posts);
    this.pagination = new CursorPagination(posts, codec);
  }

  async findById(id: string): Promise<Post | null> {
    const [post] = await this.db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    return post || null;
  }

  async findBySlug(slug: string): Promise<Post | null> {
    const [post] = await this.db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    return post || null;
  }

  async findPosts(
    input?: PaginationInput<PostSortColumn> & {
      status?: PostStatus | undefined;
      search?: string | undefined;
    }
  ): Promise<PaginatedResponse<Post>> {
    const filters: SQL[] = [];

    if (input?.status) {
      filters.push(eq(posts.status, input.status));
    }

    if (input?.search) {
      const searchCondition = or(
        ilike(posts.title, `%${input.search}%`),
        ilike(posts.content, `%${input.search}%`)
      );
      if (searchCondition) {
        filters.push(searchCondition);
      }
    }

    let baseCondition: SQL | undefined;
    if (filters.length === 0) {
      baseCondition = undefined;
    } else if (filters.length === 1) {
      baseCondition = filters[0];
    } else {
      baseCondition = and(...filters);
    }

    const baseQuery = this.db.select().from(posts).$dynamic();

    return this.pagination.paginate(
      baseQuery,
      input,
      this.sortableColumns,
      baseCondition
    );
  }

  async create(data: NewPost): Promise<Post> {
    const [newPost] = await this.auditDb.insert(posts).values(data).returning();

    if (!newPost) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create post',
      });
    }

    return newPost;
  }

  async update(
    id: string,
    data: {
      title?: string | undefined;
      content?: string | undefined;
      slug?: string | undefined;
      status?: PostStatus | undefined;
      publishedAt?: Date | null | undefined;
    },
    tx?: Database
  ): Promise<Post> {
    const auditableDb = this.getAuditableDb(tx);
    const [updatedPost] = await auditableDb
      .update(posts)
      .set(data as Partial<Post>)
      .where(eq(posts.id, id))
      .returning();

    if (!updatedPost) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Post not found',
      });
    }

    return updatedPost;
  }

  async delete(id: string, tx?: Database): Promise<void> {
    const database = tx || this.db;
    await database.delete(posts).where(eq(posts.id, id));
  }
}
