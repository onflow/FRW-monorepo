#!/usr/bin/env node

/**
 * Clean RevoPush CodePush duplicate class files
 * This script removes duplicate NativeFRWBridge classes that cause R8 build failures
 */

const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, '..', '..', 'node_modules');
const revopushPaths = [
  path.join(
    nodeModulesPath,
    '.pnpm',
    '@revopush+react-native-code-push@1.2.0_@types+node@22.17.0',
    'node_modules',
    '@revopush',
    'react-native-code-push',
    'android',
    'app',
    'build'
  ),
  path.join(
    nodeModulesPath,
    '.pnpm',
    '@revopush+react-native-code-push@1.2.0',
    'node_modules',
    '@revopush',
    'react-native-code-push',
    'android',
    'app',
    'build'
  ),
];

function cleanDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`Removing RevoPush build directory: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  }
  return false;
}

function main() {
  console.log('🧹 Cleaning RevoPush CodePush duplicate classes...');

  let cleaned = false;
  revopushPaths.forEach(dirPath => {
    if (cleanDirectory(dirPath)) {
      cleaned = true;
    }
  });

  if (cleaned) {
    console.log('✅ RevoPush duplicate classes cleaned successfully');
  } else {
    console.log('ℹ️  No RevoPush duplicate classes found to clean');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
