const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Alias @project/ui to source files so Metro transforms them with NativeWind
config.resolver.extraNodeModules = {
  '@project/ui': path.resolve(workspaceRoot, 'packages/ui/src'),
};

// CRITICAL: Required for NativeWind to work with workspace packages
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16,
});
