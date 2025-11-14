import type { Database } from '@project/db';
import { PostRepository } from '../features/posts/posts.repository';
import { PostService } from '../features/posts/posts.service';
import type {
  DIContainer,
  RepositoryContainer,
  ServiceContainer,
} from './container';

export function createDIContainer(_db: Database): DIContainer {
  const repositories: RepositoryContainer = {
    posts: (db: Database) => new PostRepository(db),
    // Add more repository factories here
  };

  // Create service instances (singletons) with repository factories
  const postService = new PostService(repositories.posts);

  const services: ServiceContainer = {
    posts: postService,
    // Add more services here
  };

  return {
    repositories,
    services,
  };
}
