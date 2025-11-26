#!/usr/bin/env node

const { stat } = require('fs').promises;
const { execSync, exec } = require('child_process');
const { promisify } = require('util');
const { glob } = require('glob');
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

// Configuration
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const BATCH_SIZE = 3; // Process files in parallel batches (reduced to avoid overwhelming ImageOptim apps)
const EXCLUDE_PATTERNS = [
  // Dependencies and version control
  'node_modules/**',
  '.git/**',
  '.svn/**',

  // Build outputs
  'dist/**',
  'build/**',
  'out/**',
  '.next/**',
  '_next/**',
  'apps/*/dist/**',
  'packages/*/dist/**',
  'apps/extension/dist/**',
  'apps/react-native/android/build/**',
  'apps/react-native/ios/build/**',

  // Cache directories
  '.cache/**',
  '.parcel-cache/**',
  '.turbo/**',
  '.webpack/**',
  'coverage/**',
  'tmp/**',
  'temp/**',

  // IDE and editor files
  '.vscode/**',
  '.idea/**',
  '*.swp',
  '*.swo',
  '.DS_Store',
  'Thumbs.db',

  // Package manager files
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',

  // Already optimized files
  '**/*.min.*',
  '**/*-optimized.*',
  '**/*-compressed.*',

  // Documentation builds
  'docs/build/**',
  'documentation/**',
  'storybook-static/**',

  // React Native specific
  'android/build/**',
  'ios/build/**',
  '**/DerivedData/**',
  'metro-stats.json',

  // Additional common folders
  'public/static/**',
  'static/**',
  'assets/generated/**',
  'generated/**',
  'vendor/**',
  'third-party/**',
  'third_party/**',
];

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

  if (!['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) {
    return { processed: false, originalSize, optimizedSize: originalSize };
  }

  // Try ImageAlpha first for PNG files, then fallback to ImageOptim
  if (ext === '.png') {
    try {
      await execAsync(`imageoptim --imagealpha "${filePath}"`);

      const optimizedStats = await stat(filePath);
      const optimizedSize = optimizedStats.size;

      if (optimizedSize < originalSize) {
        const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
        console.log(
          `     ✅ ImageAlpha: ${originalSize} → ${optimizedSize} bytes (${savings}% savings)`
        );
      } else {
        console.log(`     ➡️  ImageAlpha: no optimization needed`);
      }

      return { processed: true, originalSize, optimizedSize };
    } catch {
      // ImageAlpha failed, try regular ImageOptim
      console.log(`     ⚠️  ImageAlpha failed, trying ImageOptim...`);
      try {
        await execAsync(`imageoptim "${filePath}"`);

        const optimizedStats = await stat(filePath);
        const optimizedSize = optimizedStats.size;

        if (optimizedSize < originalSize) {
          const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
          console.log(
            `     ✅ ImageOptim: ${originalSize} → ${optimizedSize} bytes (${savings}% savings)`
          );
        } else {
          console.log(`     ➡️  ImageOptim: no optimization needed`);
        }

        return { processed: true, originalSize, optimizedSize };
      } catch {
        console.error(`     ❌ Both ImageAlpha and ImageOptim failed`);
        return { processed: false, originalSize, optimizedSize: originalSize };
      }
    }
  } else {
    // For non-PNG files, use regular ImageOptim
    try {
      await execAsync(`imageoptim "${filePath}"`);

      const optimizedStats = await stat(filePath);
      const optimizedSize = optimizedStats.size;

      if (optimizedSize < originalSize) {
        const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(1);
        console.log(
          `     ✅ ImageOptim: ${originalSize} → ${optimizedSize} bytes (${savings}% savings)`
        );
      } else {
        console.log(`     ➡️  ImageOptim: no optimization needed`);
      }

      return { processed: true, originalSize, optimizedSize };
    } catch {
      console.error(`     ❌ ImageOptim failed`);
      return { processed: false, originalSize, optimizedSize: originalSize };
    }
  }
}

async function findImageFiles(customExcludes = []) {
  const patterns = IMAGE_EXTENSIONS.map((ext) => `**/*${ext}`);
  const allFiles = [];
  const excludePatterns = [...EXCLUDE_PATTERNS, ...customExcludes];

  for (const pattern of patterns) {
    try {
      const files = await glob(pattern, {
        ignore: excludePatterns,
        nodir: true,
        absolute: true,
      });
      allFiles.push(...files);
    } catch (error) {
      console.error(`Error finding files with pattern ${pattern}:`, error.message);
    }
  }

  // Remove duplicates and sort
  return [...new Set(allFiles)].sort();
}

function showHelp() {
  console.log(`🔍 Bulk Image Optimization Tool
================================

Usage: node scripts/bulk-optimize-images.js [options]

Options:
  -n, --dry-run              Show what files would be optimized (no changes)
  -f, --force                Skip confirmation prompt
  --exclude=<pattern>        Add custom exclude pattern (can be used multiple times)
  -h, --help                 Show this help message

Examples:
  node scripts/bulk-optimize-images.js --dry-run
  node scripts/bulk-optimize-images.js --force
  node scripts/bulk-optimize-images.js --exclude="**/my-folder/**"
  pnpm optimize-images --dry-run
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  const isDryRun = args.includes('--dry-run') || args.includes('-n');
  const isForce = args.includes('--force') || args.includes('-f');
  const customExcludes = args
    .filter((arg) => arg.startsWith('--exclude='))
    .map((arg) => arg.split('=')[1]);

  console.log('🔍 Bulk Image Optimization Tool');
  console.log('================================\n');

  if (isDryRun) {
    console.log('🏃‍♂️ DRY RUN MODE - No files will be modified\n');
  }

  // Check platform and tool availability
  if (os.platform() !== 'darwin') {
    console.log('❌ This tool requires macOS and ImageOptim-CLI');
    console.log('   Install with: brew install imageoptim-cli');
    process.exit(1);
  }

  if (!(await checkImageOptimCLI())) {
    console.log('❌ ImageOptim-CLI not found');
    console.log('   Install with: brew install imageoptim-cli');
    process.exit(1);
  }

  console.log('✅ ImageOptim-CLI detected\n');

  // Find all image files
  console.log('🔍 Finding image files...');
  const imageFiles = await findImageFiles(customExcludes);

  if (imageFiles.length === 0) {
    console.log('No image files found.');
    return;
  }

  console.log(`📁 Found ${imageFiles.length} image files\n`);

  // Show what will be processed
  const filesByType = {};
  imageFiles.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    filesByType[ext] = (filesByType[ext] || 0) + 1;
  });

  console.log('📊 File types to process:');
  Object.entries(filesByType).forEach(([ext, count]) => {
    console.log(`   ${ext}: ${count} files`);
  });

  // Ask for confirmation (skip if force or dry-run)
  if (!isForce && !isDryRun) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const confirmed = await new Promise((resolve) => {
      rl.question('\n🤔 Continue with optimization? (y/N): ', (answer) => {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
    rl.close();

    if (!confirmed) {
      console.log('Cancelled.');
      return;
    }
  }

  if (isDryRun) {
    console.log('\n🏃‍♂️ DRY RUN - Showing what would be optimized:\n');
    imageFiles.forEach((file, index) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`  [${index + 1}] ${relativePath}`);
    });
    console.log(
      `\n✨ Would process ${imageFiles.length} files in ${Math.ceil(imageFiles.length / BATCH_SIZE)} batches`
    );
    return;
  }

  // Start optimization
  console.log('\n🚀 Starting optimization...\n');

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let processedCount = 0;
  let errorCount = 0;
  let completedCount = 0;

  // Process files in parallel batches
  for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
    const batch = imageFiles.slice(i, i + BATCH_SIZE);

    console.log(
      `📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(imageFiles.length / BATCH_SIZE)} (${batch.length} files)`
    );

    // Process batch in parallel
    const batchPromises = batch.map(async (file, batchIndex) => {
      const globalIndex = i + batchIndex;
      const relativePath = path.relative(process.cwd(), file);

      console.log(`  [${globalIndex + 1}/${imageFiles.length}] Starting: ${relativePath}`);

      try {
        const startTime = Date.now();
        const result = await optimizeWithImageOptimCLI(file);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(
          `  [${globalIndex + 1}/${imageFiles.length}] Completed in ${duration}s: ${relativePath}`
        );
        return result;
      } catch (error) {
        console.error(`  ❌ Error processing ${relativePath}:`, error.message);
        return { processed: false, originalSize: 0, optimizedSize: 0 };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    // Update totals
    for (const result of batchResults) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
      completedCount++;

      if (result.processed) {
        processedCount++;
      } else {
        errorCount++;
      }
    }

    // Show progress
    const progressPercent = ((completedCount / imageFiles.length) * 100).toFixed(1);
    console.log(`  📊 Progress: ${completedCount}/${imageFiles.length} (${progressPercent}%)\n`);

    // Small delay between batches to avoid overwhelming the system
    if (i + BATCH_SIZE < imageFiles.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Summary
  console.log('📈 Optimization Summary');
  console.log('=======================');
  console.log(`Total files: ${imageFiles.length}`);
  console.log(`Processed: ${processedCount}`);
  console.log(`Errors: ${errorCount}`);

  if (totalOriginalSize > 0) {
    const totalSavings = totalOriginalSize - totalOptimizedSize;
    const totalSavingsPercent = ((totalSavings / totalOriginalSize) * 100).toFixed(1);

    console.log(`Original size: ${formatBytes(totalOriginalSize)}`);
    console.log(`Optimized size: ${formatBytes(totalOptimizedSize)}`);
    console.log(`Total savings: ${formatBytes(totalSavings)} (${totalSavingsPercent}%)`);
  }

  console.log('\n✅ Optimization complete!');
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
