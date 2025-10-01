#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SVG_DIR = 'assets';
const WEB_OUTPUT_DIR = 'src/web';
const NATIVE_OUTPUT_DIR = 'src/react-native';

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
      const webOutputFile = getOutputFilePath(relativePath, WEB_OUTPUT_DIR);
      const nativeOutputFile = getOutputFilePath(relativePath, NATIVE_OUTPUT_DIR);

      files.push({
        svgPath: fullPath,
        relativePath: relativePath,
        webOutputDir: path.join(WEB_OUTPUT_DIR, path.dirname(relativePath)),
        nativeOutputDir: path.join(NATIVE_OUTPUT_DIR, path.dirname(relativePath)),
        webOutputFile: webOutputFile,
        nativeOutputFile: nativeOutputFile,
        name: path.basename(item, '.svg'),
      });
    }
  }

  return files;
}

function getOutputFilePath(svgRelativePath, outputDir) {
  // Convert SVG filename to React component filename
  const name = path.basename(svgRelativePath, '.svg');
  const componentName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  const dir = path.dirname(svgRelativePath);
  return path.join(outputDir, dir, `${componentName}.generated.tsx`);
}

function shouldConvertFile(file) {
  if (forceRegenerate) {
    return true;
  }

  // Only convert if either output file doesn't exist
  return !fs.existsSync(file.webOutputFile) || !fs.existsSync(file.nativeOutputFile);
}

function generateReactNativeIcon(componentName, svgPath, outputDir) {
  // Use svgr CLI to generate React Native components, similar to the React Native project approach
  try {
    console.log(`Generating React Native icon: ${componentName}`);

    // Use svgr CLI with minimal optimizations to preserve exact shapes
    execSync(
      `npx -y @svgr/cli --out-dir "${outputDir}" "${svgPath}" --typescript --native --icon`,
      { stdio: 'pipe' }
    );

    // The svgr CLI generates with PascalCase filename, not the original SVG filename
    const svgrOutputPath = path.join(outputDir, `${componentName}.tsx`);
    const finalOutputPath = path.join(outputDir, `${componentName}.generated.tsx`);

    if (fs.existsSync(svgrOutputPath)) {
      // Read the generated content and modify it to match our API
      let content = fs.readFileSync(svgrOutputPath, 'utf8');

      // Extract the SVG components used in this icon
      const svgComponents = new Set();
      const componentMatches = content.match(/<([A-Z][a-zA-Z]*)/g);
      if (componentMatches) {
        componentMatches.forEach((match) => {
          const componentName = match.substring(1);
          // Only include actual react-native-svg components, not Svg itself
          if (componentName !== 'Svg' && componentName !== 'IconWrapper') {
            svgComponents.add(componentName);
          }
        });
      }

      const svgImports = Array.from(svgComponents).sort().join(', ');

      // Update the component to use dynamic colors and fix issues
      content = content
        // Use exact same import format as svgr CLI output
        .replace(
          /import \* as React from 'react';|import React from 'react';/,
          `import * as React from "react"\nimport Svg, { type SvgProps, ${svgImports} } from "react-native-svg"`
        )
        // Remove old react-native-svg imports
        .replace(/import Svg, \{[^}]+\} from 'react-native-svg';\n?/, '')
        .replace(/import type \{ SvgProps \} from 'react-native-svg';\n?/, '')
        // Update component function declaration with size and color support
        .replace(
          /const Svg\w+ = \(props: SvgProps\) => \(/,
          `const ${componentName} = ({ color = "currentColor", size = 24, width, height, ...props }: SvgProps & { size?: number }) => (`
        )
        // Update Svg wrapper to add dynamic size support while preserving other attributes
        .replace(/<Svg([^>]*)>/, (match, attributes) => {
          // Extract viewBox from attributes
          const viewBoxMatch = attributes.match(/viewBox="([^"]+)"/);
          const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

          // Extract fill attribute if present
          const fillMatch = attributes.match(/fill="([^"]+)"/);
          const fill = fillMatch ? ` fill="${fillMatch[1]}"` : '';

          return `<Svg xmlns="http://www.w3.org/2000/svg" width={width ?? size} height={height ?? size}${fill} viewBox="${viewBox}" {...props}>`;
        })
        // Replace hardcoded colors with dynamic color (both quoted and unquoted)
        // But preserve fill="none" in Svg elements
        .replace(/<Svg([^>]*)\sfill={color}([^>]*)>/g, (match, before, after) => {
          return `<Svg${before} fill="none"${after}>`;
        })
        // Replace fill/stroke in Path and other elements (not Svg)
        .replace(
          /<(Path|Circle|Rect|Ellipse|Line|Polyline|Polygon)([^>]*)\sfill="[^"]*"([^>]*)/g,
          '<$1$2 fill={color}$3'
        )
        .replace(
          /<(Path|Circle|Rect|Ellipse|Line|Polyline|Polygon)([^>]*)\sstroke="[^"]*"([^>]*)/g,
          '<$1$2 stroke={color}$3'
        )
        .replace(
          /<(Path|Circle|Rect|Ellipse|Line|Polyline|Polygon)([^>]*)\sfill='[^']*'([^>]*)/g,
          '<$1$2 fill={color}$3'
        )
        .replace(
          /<(Path|Circle|Rect|Ellipse|Line|Polyline|Polygon)([^>]*)\sstroke='[^']*'([^>]*)/g,
          '<$1$2 stroke={color}$3'
        )
        // Keep stroke-opacity and fill-opacity as they're important for visual accuracy
        // Only remove general opacity which can be controlled externally
        .replace(/\s+opacity=\{[^}]+\}/g, '')
        // Add stroke attributes to Path elements that have neither fill nor stroke
        // This handles outline icons that SVGR doesn't generate with color attributes
        .replace(/<(Path)([^>]*?)(\/?>)/g, (match, tagName, attributes, closing) => {
          // Only add stroke attributes if the element has neither fill nor stroke
          if (!attributes.includes('fill=') && !attributes.includes('stroke=')) {
            return `<${tagName}${attributes} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"${closing}`;
          }
          return match;
        })
        // Update export statement to match svgr CLI format
        .replace(/export default Svg\w+;/, `export default ${componentName}`);

      // Write the modified content to our target file
      fs.writeFileSync(finalOutputPath, content);

      // Remove the original svgr output file
      fs.unlinkSync(svgrOutputPath);
    }

    return true;
  } catch (error) {
    console.error(`Failed to generate React Native icon ${componentName}:`, error.message);
    return false;
  }
}

function convertSvgFile(file) {
  console.log(`Converting: ${file.relativePath}`);

  // Ensure output directories exist
  if (!fs.existsSync(file.webOutputDir)) {
    fs.mkdirSync(file.webOutputDir, { recursive: true });
  }
  if (!fs.existsSync(file.nativeOutputDir)) {
    fs.mkdirSync(file.nativeOutputDir, { recursive: true });
  }

  const componentName = path
    .basename(file.name)
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  try {
    // Generate Web version using the existing method
    const svgContent = fs.readFileSync(file.svgPath, 'utf8');

    // Extract SVG content (everything inside <svg> tags)
    const svgMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (!svgMatch) {
      throw new Error(`Could not parse SVG content from ${file.svgPath}`);
    }

    // Convert HTML attributes to React camelCase attributes
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

    // Calculate relative paths to IconWrapper based on depth
    const depth = file.relativePath.split('/').length - 1;
    const webIconWrapperPath =
      depth > 0 ? '../'.repeat(depth + 1) + 'IconWrapper' : '../IconWrapper';

    // Generate Web version (HTML SVG)
    const webComponentContent = `import { IconWrapper, type IconWrapperProps } from '${webIconWrapperPath}';

const ${componentName} = (props: IconWrapperProps) => (
  <IconWrapper viewBox="${viewBox}" {...props}>
    ${innerSvgContent}
  </IconWrapper>
);

export default ${componentName};
`;

    // Write Web version
    const webOutputPath = path.join(file.webOutputDir, `${componentName}.generated.tsx`);
    fs.writeFileSync(webOutputPath, webComponentContent);

    // Generate React Native version using svgr CLI
    const nativeSuccess = generateReactNativeIcon(
      componentName,
      file.svgPath,
      file.nativeOutputDir
    );

    return nativeSuccess; // Both web and native must succeed
  } catch (error) {
    console.error(`Failed to convert ${file.relativePath}:`, error.message);
    return false;
  }
}

function cleanOrphanedFiles(currentSvgFiles) {
  console.log('🧹 Cleaning orphaned generated files...');

  let cleanedCount = 0;

  // Get all expected generated files from current SVG files
  const expectedFiles = new Set();
  currentSvgFiles.forEach((file) => {
    expectedFiles.add(file.webOutputFile);
    expectedFiles.add(file.nativeOutputFile);
  });

  // Clean orphaned files in both directories
  [WEB_OUTPUT_DIR, NATIVE_OUTPUT_DIR].forEach((outputDir) => {
    if (!fs.existsSync(outputDir)) return;

    function cleanDirectory(dir) {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          cleanDirectory(fullPath);
          // Remove empty directories
          const remainingItems = fs.readdirSync(fullPath);
          if (remainingItems.length === 0) {
            fs.rmdirSync(fullPath);
            console.log(`  🗂️  Removed empty directory: ${path.relative('.', fullPath)}`);
          }
        } else if (item.endsWith('.generated.tsx')) {
          // Check if this generated file should exist
          if (!expectedFiles.has(fullPath)) {
            fs.unlinkSync(fullPath);
            cleanedCount++;
            console.log(`  🗑️  Removed orphaned file: ${path.relative('.', fullPath)}`);
          }
        }
      }
    }

    cleanDirectory(outputDir);
  });

  if (cleanedCount > 0) {
    console.log(`✅ Cleaned ${cleanedCount} orphaned files`);
  } else {
    console.log('✅ No orphaned files found');
  }
}

function updateIndexFiles() {
  console.log('Updating index files...');

  // Generate index files for each directory
  function generateIndexForDir(dir) {
    if (!fs.existsSync(dir)) return;

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
      } else if (item.endsWith('.generated.tsx')) {
        // Handle generated component file
        const componentName = path.basename(item, '.generated.tsx');
        exports.push(`export { default as ${componentName} } from './${componentName}.generated';`);
      }
    }

    if (exports.length > 0) {
      const indexPath = path.join(dir, 'index.generated.ts');
      fs.writeFileSync(indexPath, exports.join('\n') + '\n');
    }
  }

  // Generate index files for both web and native components
  generateIndexForDir(WEB_OUTPUT_DIR);
  generateIndexForDir(NATIVE_OUTPUT_DIR);
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

  // Clean orphaned files (files that exist but no longer have corresponding SVG)
  cleanOrphanedFiles(svgFiles);

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
