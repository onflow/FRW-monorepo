#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SVG_DIR = 'public/icons';
const OUTPUT_DIR = 'src/assets/icons';

// Check command line arguments
const forceRegenerate = process.argv.includes('--force');

// Helper functions
function getAllSvgFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllSvgFiles(fullPath, baseDir));
    } else if (item.endsWith('.svg')) {
      const relativePath = path.relative(baseDir, fullPath);
      const outputFile = getOutputFilePath(relativePath);

      files.push({
        svgPath: fullPath,
        relativePath: relativePath,
        outputDir: path.join(OUTPUT_DIR, path.dirname(relativePath)),
        outputFile: outputFile,
        name: path.basename(item, '.svg'),
      });
    }
  }

  return files;
}

function getOutputFilePath(svgRelativePath) {
  // Convert SVG filename to React component filename
  const name = path.basename(svgRelativePath, '.svg');
  const componentName = name
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const dir = path.dirname(svgRelativePath);
  return path.join(OUTPUT_DIR, dir, `${componentName}.tsx`);
}

function shouldConvertFile(file) {
  if (forceRegenerate) {
    return true;
  }

  // Only convert if output file doesn't exist
  return !fs.existsSync(file.outputFile);
}

function convertSvgFile(file) {
  console.log(`Converting: ${file.relativePath}`);

  // Ensure output directory exists
  if (!fs.existsSync(file.outputDir)) {
    fs.mkdirSync(file.outputDir, { recursive: true });
  }

  try {
    execSync(
      `npx -y @svgr/cli --out-dir "${file.outputDir}" "${file.svgPath}" --typescript --native --icon`,
      { stdio: 'inherit' }
    );
    return true;
  } catch (error) {
    console.error(`Failed to convert ${file.relativePath}:`, error.message);
    return false;
  }
}

function updateIndexFiles() {
  console.log('Updating index files...');

  // Generate index files for each directory
  function generateIndexForDir(dir) {
    const items = fs.readdirSync(dir);
    const exports = [];

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Handle subdirectory
        generateIndexForDir(fullPath);
        const dirName = item;
        exports.push(`export * from './${dirName}';`);
      } else if (item.endsWith('.tsx') && item !== 'index.ts') {
        // Handle component file
        const componentName = path.basename(item, '.tsx');
        exports.push(`export { default as ${componentName} } from './${componentName}';`);
      }
    }

    if (exports.length > 0) {
      const indexPath = path.join(dir, 'index.ts');
      fs.writeFileSync(indexPath, exports.join('\n') + '\n');
    }
  }

  if (fs.existsSync(OUTPUT_DIR)) {
    generateIndexForDir(OUTPUT_DIR);
  }
}

function main() {
  const mode = forceRegenerate ? 'force regenerate' : 'incremental';
  console.log(`🎨 SVG to React component generator (${mode} mode)`);

  if (!fs.existsSync(SVG_DIR)) {
    console.error(`SVG directory not found: ${SVG_DIR}`);
    process.exit(1);
  }

  const svgFiles = getAllSvgFiles(SVG_DIR);

  if (svgFiles.length === 0) {
    console.log('No SVG files found.');
    return;
  }

  console.log(`Found ${svgFiles.length} SVG files`);

  // Check which files need to be processed
  const filesToProcess = svgFiles.filter(file => shouldConvertFile(file));

  if (filesToProcess.length === 0) {
    console.log('✅ All icons are up to date!');
    return;
  }

  if (forceRegenerate) {
    console.log('🔄 Force regenerating ALL icons...');
  } else {
    console.log(`📝 Processing ${filesToProcess.length} missing files:`);
    filesToProcess.forEach(file => console.log(`  - ${file.relativePath}`));
  }

  // Process files
  let successCount = 0;

  for (const file of filesToProcess) {
    if (convertSvgFile(file)) {
      successCount++;
    }
  }

  // Update index files
  updateIndexFiles();

  console.log(`✅ Successfully converted ${successCount}/${filesToProcess.length} icons`);

  if (successCount !== filesToProcess.length) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
