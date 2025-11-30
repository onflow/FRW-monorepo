#!/usr/bin/env node

const { stat } = require('fs').promises;
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

async function checkImageOptimCLI() {
  try {
    execSync('which imageoptim', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function optimizeWithImageOptimCLI(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalStats = await stat(filePath);
  const originalSize = originalStats.size;

  try {
    let cmd;

    // Use different optimization strategy based on file type
    switch (ext) {
      case '.png':
        // Use ImageAlpha for PNG files (better compression)
        cmd = `imageoptim --imagealpha "${filePath}"`;
        break;
      case '.jpg':
      case '.jpeg':
        // Use default ImageOptim for JPEG
        cmd = `imageoptim "${filePath}"`;
        break;
      case '.gif':
      case '.webp':
        // Use ImageOptim for other formats
        cmd = `imageoptim "${filePath}"`;
        break;
      default:
        console.log(`Skipped: ${filePath} (unsupported format)`);
        return true;
    }

    // Execute optimization
    execSync(cmd, { stdio: 'ignore' });

    const optimizedStats = await stat(filePath);
    const optimizedSize = optimizedStats.size;

    if (optimizedSize < originalSize) {
      const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
      console.log(
        `Optimized: ${filePath} (${originalSize} → ${optimizedSize} bytes, ${savings}% savings)`
      );
    } else {
      console.log(`Processed: ${filePath} (${originalSize} bytes) - no optimization needed`);
    }

    return true;
  } catch (error) {
    console.error(`Error optimizing ${filePath} with ImageOptim-CLI:`, error.message);
    return false;
  }
}

async function fallbackOptimization(filePath) {
  // Simple fallback: just validate the file exists and is readable
  const ext = path.extname(filePath).toLowerCase();

  if (!['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
    console.log(`Skipped: ${filePath} (unsupported format)`);
    return true;
  }

  try {
    const stats = await stat(filePath);
    console.log(
      `Validated: ${filePath} (${stats.size} bytes) - ImageOptim not available on this platform`
    );
    return true;
  } catch (error) {
    console.error(`Error validating ${filePath}:`, error.message);
    return false;
  }
}

async function optimizeImage(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();

    if (!['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
      console.log(`Skipped: ${filePath} (unsupported format)`);
      return true;
    }

    // Check if we're on macOS and have ImageOptim-CLI available
    if (os.platform() === 'darwin' && (await checkImageOptimCLI())) {
      return await optimizeWithImageOptimCLI(filePath);
    } else {
      // Fallback for non-macOS platforms or when ImageOptim-CLI is not available
      return await fallbackOptimization(filePath);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  const files = process.argv.slice(2);

  if (files.length === 0) {
    console.log('Usage: node optimize-images.js <file1> <file2> ...');
    process.exit(1);
  }

  let success = true;

  for (const file of files) {
    const result = await optimizeImage(file);
    if (!result) {
      success = false;
    }
  }

  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}
