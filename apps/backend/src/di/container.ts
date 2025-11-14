import type { Database } from '@project/db';
import type { PostRepository } from '../features/posts/posts.repository';
import type { PostService } from '../features/posts/posts.service';

export type RepositoryFactory<T> = (db: Database) => T;

export type ServiceFactory<T> = () => T;

// Define repository and service containers as needed
// This is a template - expand as you add features
export interface RepositoryContainer {
  posts: RepositoryFactory<PostRepository>;
  // Add more repositories here
}

export interface ServiceContainer {
  posts: PostService;
  // Add more services here
}

export interface DIContainer {
  repositories: RepositoryContainer;
  services: ServiceContainer;
}
