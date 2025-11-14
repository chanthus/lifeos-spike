import type { Database } from '@project/db';
import type { Context } from './trpc';
import { createDIContainer } from './di/container.impl';

let _container: ReturnType<typeof createDIContainer> | null = null;

export function getContainer(
  db: Database
): ReturnType<typeof createDIContainer> {
  if (!_container) {
    _container = createDIContainer(db);
  }
  return _container;
}

/**
 * Create context for tRPC procedures
 * Contains only db and services - repositories are instantiated by services on-demand
 */
export function createContext(db: Database): Context {
  const container = getContainer(db);

  return {
    db,
    services: container.services,
  };
}
