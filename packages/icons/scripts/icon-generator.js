#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SVG_DIR = 'assets';
const OUTPUT_DIR = 'src/components';

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
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
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
    // Generate a custom React component using our IconWrapper
    const svgContent = fs.readFileSync(file.svgPath, 'utf8');
    const componentName = path
      .basename(file.name)
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    // Extract SVG content (everything inside <svg> tags)
    const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (!svgMatch) {
      throw new Error(`Could not parse SVG content from ${file.svgPath}`);
    }

    // Convert HTML attributes to React camelCase attributes and apply IconPark color classes
    let innerSvgContent = svgMatch[1]
      .replace(/stroke-width/g, 'strokeWidth')
      .replace(/stroke-opacity/g, 'strokeOpacity')
      .replace(/fill-opacity/g, 'fillOpacity')
      .replace(/stroke-linecap/g, 'strokeLinecap')
      .replace(/stroke-linejoin/g, 'strokeLinejoin')
      .replace(/stroke-miterlimit/g, 'strokeMiterlimit')
      .replace(/stroke-dasharray/g, 'strokeDasharray')
      .replace(/stroke-dashoffset/g, 'strokeDashoffset')
      .replace(/fill-rule/g, 'fillRule')
      .replace(/clip-rule/g, 'clipRule')
      .replace(/clip-path/g, 'clipPath')
      // Remove problematic data attributes that can cause React issues
      .replace(/data-[^=]*="[^"]*"/g, '')
      // Remove foreignObject elements as they often contain problematic HTML
      .replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/g, '');

    // Clean up any extra spaces and format properly
    innerSvgContent = innerSvgContent.replace(/\s+/g, ' ').replace(/> </g, '>\n    <').trim();

    // Extract viewBox from original SVG
    const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

    // Calculate relative path to runtime based on depth
    const depth = file.relativePath.split('/').length - 1;
    const runtimePath =
      depth > 0 ? '../'.repeat(depth + 1) + 'runtime/IconWrapper' : '../runtime/IconWrapper';

    // Generate TypeScript component using IconWrapper
    const componentContent = `import { IconWrapper, type IconWrapperProps } from '${runtimePath}';

const Svg${componentName} = (props: IconWrapperProps) => (
  <IconWrapper viewBox="${viewBox}" {...props}>
    ${innerSvgContent}
  </IconWrapper>
);

export default Svg${componentName};
`;

    const outputPath = path.join(file.outputDir, `${componentName}.tsx`);
    fs.writeFileSync(outputPath, componentContent);

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

  // Generate root index file
  const rootIndexPath = path.join('src', 'index.ts');
  const rootExports = [];

  if (fs.existsSync(OUTPUT_DIR)) {
    const items = fs.readdirSync(OUTPUT_DIR);
    for (const item of items) {
      const fullPath = path.join(OUTPUT_DIR, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        rootExports.push(`export * from './components/${item}';`);
      } else if (item.endsWith('.tsx') && item !== 'index.ts') {
        const componentName = path.basename(item, '.tsx');
        rootExports.push(
          `export { default as ${componentName} } from './components/${componentName}';`
        );
      }
    }

    // Also export the components barrel
    rootExports.push(`export * from './components';`);
  }

  if (rootExports.length > 0) {
    if (!fs.existsSync('src')) {
      fs.mkdirSync('src', { recursive: true });
    }
    fs.writeFileSync(rootIndexPath, rootExports.join('\n') + '\n');
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
  const filesToProcess = svgFiles.filter((file) => shouldConvertFile(file));

  if (filesToProcess.length === 0) {
    console.log('✅ All icons are up to date!');
    updateIndexFiles(); // Still update index files
    return;
  }

  if (forceRegenerate) {
    console.log('🔄 Force regenerating ALL icons...');
  } else {
    console.log(`📝 Processing ${filesToProcess.length} missing files:`);
    filesToProcess.forEach((file) => console.log(`  - ${file.relativePath}`));
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
