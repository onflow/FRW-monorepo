#!/usr/bin/env node

/**
 * Post-install cleanup script for RevoPush CodePush duplicate classes
 * This script removes the duplicate NativeFRWBridge classes from RevoPush
 * that cause R8 minification failures in release builds
 */

const fs = require('fs');
const path = require('path');

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`🗑️  Removing duplicate class directory: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    return true;
  }
  return false;
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    console.log(`🗑️  Removing duplicate class file: ${filePath}`);
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

function main() {
  console.log('🧹 Running post-install cleanup for RevoPush duplicate classes...');

  const nodeModulesPath = path.join(__dirname, '..', '..', 'node_modules');

  // Paths to clean
  const pathsToClean = [
    // Generated codegen directories
    path.join(
      nodeModulesPath,
      '.pnpm',
      '@revopush+react-native-code-push@1.2.0_@types+node@22.17.0',
      'node_modules',
      '@revopush',
      'react-native-code-push',
      'android',
      'app',
      'build',
      'generated',
      'source',
      'codegen'
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
      'build',
      'generated',
      'source',
      'codegen'
    ),

    // Build directories
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

  let cleaned = false;
  pathsToClean.forEach(dirPath => {
    if (removeDirectory(dirPath)) {
      cleaned = true;
    }
  });

  // Also look for any specific files
  const filesToClean = [
    path.join(
      nodeModulesPath,
      '.pnpm',
      '@revopush+react-native-code-push@1.2.0_@types+node@22.17.0',
      'node_modules',
      '@revopush',
      'react-native-code-push',
      'android',
      'app',
      'src',
      'main',
      'java',
      'com',
      'flowfoundation',
      'wallet',
      'bridge',
      'NativeFRWBridge.kt'
    ),
  ];

  filesToClean.forEach(filePath => {
    if (removeFile(filePath)) {
      cleaned = true;
    }
  });

  if (cleaned) {
    console.log('✅ RevoPush duplicate class cleanup completed');
  } else {
    console.log('ℹ️  No RevoPush duplicate classes found to clean');
  }

  console.log('📝 Note: Run this after every npm/pnpm install to prevent duplicate class issues');
}

if (require.main === module) {
  main();
}

module.exports = { main };
