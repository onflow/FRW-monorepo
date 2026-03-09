#!/usr/bin/env node

const { stat } = require('fs').promises;
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

let cachedHasImageOptim = null;
let imageOptimDisabled = false;

async function checkImageOptimCLI() {
  if (cachedHasImageOptim !== null) {
    return cachedHasImageOptim;
  }

  try {
    execSync('which imageoptim', { stdio: 'ignore' });
    cachedHasImageOptim = true;
    return cachedHasImageOptim;
  } catch {
    cachedHasImageOptim = false;
    return cachedHasImageOptim;
  }
}

async function runOptimization(filePath, cmd, label, originalSize) {
  try {
    execSync(cmd, { stdio: 'ignore' });

    const optimizedStats = await stat(filePath);
    const optimizedSize = optimizedStats.size;

    if (optimizedSize < originalSize) {
      const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
      console.log(
        `Optimized (${label}): ${filePath} (${originalSize} → ${optimizedSize} bytes, ${savings}% savings)`
      );
    } else {
      console.log(
        `Processed (${label}): ${filePath} (${originalSize} bytes) - no optimization needed`
      );
    }

    return true;
  } catch (error) {
    console.warn(
      `Warning: ${label} failed for ${filePath}; skipping optimization (${error.message})`
    );
    return false;
  }
}

async function optimizeWithImageOptimCLI(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalStats = await stat(filePath);
  const originalSize = originalStats.size;

  try {
    switch (ext) {
      case '.png':
        // Try ImageAlpha first for better PNG compression, then fallback to ImageOptim.
        if (
          await runOptimization(
            filePath,
            `imageoptim --imagealpha "${filePath}"`,
            'ImageAlpha',
            originalSize
          )
        ) {
          return true;
        }
        await runOptimization(filePath, `imageoptim "${filePath}"`, 'ImageOptim', originalSize);
        return true;
      case '.jpg':
      case '.jpeg':
      case '.gif':
      case '.webp':
        await runOptimization(filePath, `imageoptim "${filePath}"`, 'ImageOptim', originalSize);
        return true;
      default:
        console.log(`Skipped: ${filePath} (unsupported format)`);
        return true;
    }
  } catch (error) {
    console.warn(
      `Warning: ImageOptim-CLI failed for ${filePath}; skipping optimization (${error.message})`
    );
    return true;
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

    if (imageOptimDisabled) {
      return await fallbackOptimization(filePath);
    }

    // Check if we're on macOS and have ImageOptim-CLI available
    if (os.platform() === 'darwin' && (await checkImageOptimCLI())) {
      const optimized = await optimizeWithImageOptimCLI(filePath);
      if (optimized) {
        return true;
      }
      imageOptimDisabled = true;
      console.warn(
        'Warning: ImageOptim-CLI failed; disabling optimization for the rest of this run.'
      );
      return await fallbackOptimization(filePath);
    }

    // Fallback for non-macOS platforms or when ImageOptim-CLI is not available
    return await fallbackOptimization(filePath);
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
