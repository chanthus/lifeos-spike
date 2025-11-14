import type { Database, PostStatus } from '@project/db';
import type { RepositoryFactory } from '../../di/container';
import type {
  PaginationInput,
  PaginatedResponse,
} from '../../shared/pagination.types';
import type { PostSortColumn } from './posts.schema';
import type { PostRepository } from './posts.repository';

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  status: PostStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export class PostService {
  constructor(private createRepository: RepositoryFactory<PostRepository>) {}

  async listPosts(
    input:
      | (PaginationInput<PostSortColumn> & {
          status?: PostStatus | undefined;
          search?: string | undefined;
        })
      | undefined,
    db: Database
  ): Promise<PaginatedResponse<Post>> {
    const repo = this.createRepository(db);
    return repo.findPosts(input);
  }

  async getPost(id: string, db: Database): Promise<Post | null> {
    const repo = this.createRepository(db);
    return repo.findById(id);
  }

  async createPost(
    data: {
      title: string;
      content: string;
      slug: string;
      status?: PostStatus | undefined;
      publishedAt?: Date | undefined;
    },
    db: Database
  ): Promise<Post> {
    const repo = this.createRepository(db);

    // Check for slug uniqueness
    const existing = await repo.findBySlug(data.slug);
    if (existing) {
      throw new Error('A post with this slug already exists');
    }

    return repo.create({
      title: data.title,
      content: data.content,
      slug: data.slug,
      status: data.status || 'draft',
      publishedAt: data.publishedAt || null,
    });
  }

  async updatePost(
    id: string,
    data: {
      title?: string | undefined;
      content?: string | undefined;
      slug?: string | undefined;
      status?: PostStatus | undefined;
      publishedAt?: Date | null | undefined;
    },
    db: Database,
    tx?: Database
  ): Promise<Post> {
    const repo = this.createRepository(tx || db);

    // If slug is being updated, check uniqueness
    if (data.slug) {
      const existing = await repo.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new Error('A post with this slug already exists');
      }
    }

    return repo.update(id, data, tx);
  }

  async deletePost(id: string, db: Database, tx?: Database): Promise<void> {
    const repo = this.createRepository(tx || db);
    await repo.delete(id, tx);
  }
}
