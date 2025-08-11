const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project root, where node_modules is located
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../..');

const config = getDefaultConfig(projectRoot);

// Configure monorepo settings
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure metro resolves modules from the monorepo root
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
