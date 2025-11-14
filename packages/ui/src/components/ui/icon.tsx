/**
 * Default Icon export for TypeScript compilation
 * At runtime, the bundler will use icon.web.tsx or icon.native.tsx based on platform
 *
 * This file exists only for TypeScript type resolution.
 * The actual implementation used at runtime comes from the platform-specific files.
 */
export * from './icon.native';
