#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Script to analyze service dependencies in the core package
 * and generate a dependency diagram
 *
 * Usage: pnpm tsx analyze-service-dependencies.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ServiceDependency {
  name: string;
  imports: string[];
  importedBy: string[];
}

const SERVICE_DIR = path.join(__dirname, '../src/service');
const UTILS_DIR = path.join(__dirname, '../src/utils');
const OUTPUT_FILE = path.join(__dirname, 'service-dependency-diagram.md');

// Services to exclude from analysis
const EXCLUDE_PATTERNS = ['__tests__', '.test.', '.spec.', 'index.ts', '.d.ts'];

// Map of import aliases to actual service names
const IMPORT_ALIASES: Record<string, string> = {
  analyticsService: 'analytics',
  keyringService: 'keyring',
  openapiService: 'openapi',
  userInfoService: 'user',
  nftService: 'nft',
  evmNftService: 'nft-evm',
  addressBookService: 'addressBook',
  authenticationService: 'authentication-service',
  coinListService: 'coinList',
  googleDriveService: 'googleDrive',
  googleSafeHostService: 'googleSafeHost',
  logListener: 'log-listener',
  newsService: 'news',
  permissionService: 'permission',
  preferenceService: 'preference',
  remoteConfigService: 'remoteConfig',
  sessionService: 'session',
  signTextHistoryService: 'signTextHistory',
  storageManagementService: 'storage-management',
  tokenListService: 'token-list',
  transactionActivityService: 'transaction-activity',
  transactionService: 'transactions',
  userWalletService: 'userWallet',
  versionService: 'version-service',
};

function getServiceFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (
        entry.isDirectory() &&
        !EXCLUDE_PATTERNS.some((pattern) => entry.name.includes(pattern))
      ) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        const shouldExclude = EXCLUDE_PATTERNS.some((pattern) => entry.name.includes(pattern));
        if (!shouldExclude) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

function extractModuleName(filePath: string): string {
  // Determine if this is a service or util
  const isService = filePath.includes(SERVICE_DIR);
  const baseDir = isService ? SERVICE_DIR : UTILS_DIR;
  const prefix = isService ? 'service/' : 'utils/';

  const relativePath = path.relative(baseDir, filePath);
  const withoutExt = relativePath.replace('.ts', '');

  // Handle nested modules (e.g., keyring/index.ts)
  if (withoutExt.includes('/')) {
    const parts = withoutExt.split('/');
    if (parts[parts.length - 1] === 'index') {
      return prefix + parts.slice(0, -1).join('/'); // Return parent directory name
    }
    return prefix + parts.join('/');
  }

  return prefix + withoutExt;
}

function analyzeImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports: Set<string> = new Set();
  const isService = filePath.includes(SERVICE_DIR);
  const currentDir = path.dirname(filePath);

  // Match import statements
  const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
  const importAllRegex = /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;

  let match;

  // Process named and default imports
  while ((match = importRegex.exec(content)) !== null) {
    const namedImports = match[1];
    const defaultImport = match[2];
    const importPath = match[3];

    // Process different types of imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      // Resolve relative imports
      const resolvedPath = path.resolve(currentDir, importPath);

      // Check if it's a service or util import
      if (resolvedPath.includes('/service/') || resolvedPath.includes('/utils/')) {
        // Extract module name
        const moduleName = extractModuleFromPath(resolvedPath);
        if (moduleName) {
          imports.add(moduleName);
        }
      }

      // Also handle named imports for service aliases
      if (namedImports) {
        const names = namedImports.split(',').map((n) => n.trim());
        for (const name of names) {
          const cleanName = name.split(' as ')[0].trim();
          if (IMPORT_ALIASES[cleanName]) {
            imports.add('service/' + IMPORT_ALIASES[cleanName]);
          }
        }
      }
      if (defaultImport && IMPORT_ALIASES[defaultImport]) {
        imports.add('service/' + IMPORT_ALIASES[defaultImport]);
      }
    }
  }

  // Process import * as statements
  while ((match = importAllRegex.exec(content)) !== null) {
    const importPath = match[2];
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolvedPath = path.resolve(currentDir, importPath);
      const moduleName = extractModuleFromPath(resolvedPath);
      if (moduleName) {
        imports.add(moduleName);
      }
    }
  }

  return Array.from(imports);
}

function extractModuleFromPath(resolvedPath: string): string | null {
  if (resolvedPath.includes('/service/')) {
    const serviceMatch = resolvedPath.match(/\/service\/(.+?)(?:\.ts|\/index\.ts)?$/);
    if (serviceMatch) {
      return 'service/' + serviceMatch[1].replace(/\/index$/, '');
    }
  } else if (resolvedPath.includes('/utils/')) {
    const utilMatch = resolvedPath.match(/\/utils\/(.+?)(?:\.ts|\/index\.ts)?$/);
    if (utilMatch) {
      return 'utils/' + utilMatch[1].replace(/\/index$/, '');
    }
  }
  return null;
}

function buildDependencyMap(): Map<string, ServiceDependency> {
  const serviceFiles = getServiceFiles(SERVICE_DIR);
  const utilFiles = getServiceFiles(UTILS_DIR);
  const allFiles = [...serviceFiles, ...utilFiles];
  const dependencyMap = new Map<string, ServiceDependency>();

  // Initialize all modules
  for (const file of allFiles) {
    const moduleName = extractModuleName(file);
    dependencyMap.set(moduleName, {
      name: moduleName,
      imports: [],
      importedBy: [],
    });
  }

  // Analyze imports
  for (const file of allFiles) {
    const moduleName = extractModuleName(file);
    const imports = analyzeImports(file);

    const module = dependencyMap.get(moduleName)!;
    module.imports = imports;

    // Update importedBy for each imported module
    for (const importedModule of imports) {
      const target = dependencyMap.get(importedModule);
      if (target) {
        target.importedBy.push(moduleName);
      }
    }
  }

  return dependencyMap;
}

function detectCircularDependencies(dependencyMap: Map<string, ServiceDependency>): string[][] {
  const circular: string[][] = [];
  const visited = new Set<string>();

  function dfs(current: string, path: string[], visiting: Set<string>) {
    if (visiting.has(current)) {
      // Found circular dependency
      const cycleStart = path.indexOf(current);
      circular.push(path.slice(cycleStart).concat(current));
      return;
    }

    if (visited.has(current)) return;

    visiting.add(current);
    const service = dependencyMap.get(current);

    if (service) {
      for (const dep of service.imports) {
        dfs(dep, [...path, current], new Set(visiting));
      }
    }

    visiting.delete(current);
    visited.add(current);
  }

  for (const serviceName of dependencyMap.keys()) {
    if (!visited.has(serviceName)) {
      dfs(serviceName, [], new Set());
    }
  }

  // Remove duplicate cycles
  const uniqueCycles = circular.filter(
    (cycle, index, self) =>
      index ===
      self.findIndex((c) => c.length === cycle.length && c.every((val, i) => val === cycle[i]))
  );

  return uniqueCycles;
}

function generateMermaidDiagram(
  dependencyMap: Map<string, ServiceDependency>,
  circularDeps: string[][]
): string {
  let mermaid = `graph TD
    %% Style definitions
    classDef circular fill:#ff6b6b,stroke:#c92a2a,stroke-width:3px,color:#fff
    classDef nodeps fill:#51cf66,stroke:#37b24d,stroke-width:2px
    classDef hub fill:#339af0,stroke:#1864ab,stroke-width:3px,color:#fff
    classDef normal fill:#868e96,stroke:#495057,stroke-width:2px,color:#fff
    classDef util fill:#fab005,stroke:#f59f00,stroke-width:2px

    %% Module nodes\n`;

  // Identify circular dependency nodes
  const circularNodes = new Set(circularDeps.flat());

  // Add nodes with appropriate styling
  for (const [name, module] of dependencyMap) {
    const nodeId = name.replace(/[\/-]/g, '_');
    let cssClass = 'normal';

    if (circularNodes.has(name)) {
      cssClass = 'circular';
    } else if (module.imports.length === 0) {
      cssClass = 'nodeps';
    } else if (module.imports.length >= 6 || module.importedBy.length >= 6) {
      cssClass = 'hub';
    } else if (name.startsWith('utils/')) {
      cssClass = 'util';
    }

    // Use subgraphs to group services and utils
    const displayName = name.replace('service/', '').replace('utils/', '');
    mermaid += `    ${nodeId}["${displayName}"]:::${cssClass}\n`;
  }

  mermaid += '\n    %% Dependencies\n';

  // Add edges
  for (const [name, module] of dependencyMap) {
    const fromId = name.replace(/[\/-]/g, '_');
    for (const dep of module.imports) {
      const toId = dep.replace(/[\/-]/g, '_');
      mermaid += `    ${fromId} --> ${toId}\n`;
    }
  }

  mermaid += `
    %% Legend
    subgraph Legend
        L1[No Dependencies]:::nodeps
        L2[Circular Dependency]:::circular
        L3[Hub - Many Dependencies]:::hub
        L4[Normal Service]:::normal
        L5[Utility Module]:::util
    end`;

  return mermaid;
}

function generateMarkdown(
  dependencyMap: Map<string, ServiceDependency>,
  circularDeps: string[][]
): string {
  const serviceCount = Array.from(dependencyMap.keys()).filter((k) =>
    k.startsWith('service/')
  ).length;
  const utilCount = Array.from(dependencyMap.keys()).filter((k) => k.startsWith('utils/')).length;

  const stats = {
    totalModules: dependencyMap.size,
    totalServices: serviceCount,
    totalUtils: utilCount,
    noDepsModules: 0,
    hubModules: [] as { name: string; count: number }[],
    mostDepended: [] as { name: string; count: number }[],
    longestChain: 0,
  };

  // Calculate statistics
  for (const [name, module] of dependencyMap) {
    if (module.imports.length === 0) {
      stats.noDepsModules++;
    }
    if (module.imports.length >= 6) {
      stats.hubModules.push({ name, count: module.imports.length });
    }
    if (module.importedBy.length >= 5) {
      stats.mostDepended.push({ name, count: module.importedBy.length });
    }
  }

  stats.hubModules.sort((a, b) => b.count - a.count);
  stats.mostDepended.sort((a, b) => b.count - a.count);

  let markdown = `# Core Package Dependency Diagram

## Overview
This diagram shows the dependencies between services and utilities in the \`@onflow/frw-core\` package.
Generated on: ${new Date().toISOString()}

## Statistics
- Total modules: ${stats.totalModules}
  - Services: ${stats.totalServices}
  - Utilities: ${stats.totalUtils}
- Modules with no dependencies: ${stats.noDepsModules}
- Circular dependencies found: ${circularDeps.length}

## Mermaid Dependency Graph

\`\`\`mermaid
${generateMermaidDiagram(dependencyMap, circularDeps)}
\`\`\`

## Key Findings

### 1. Circular Dependencies${circularDeps.length > 0 ? ' (Critical Issues)' : ''}
`;

  if (circularDeps.length > 0) {
    for (const cycle of circularDeps) {
      markdown += `- **${cycle.join(' ↔ ')}**\n`;
    }
  } else {
    markdown += 'No circular dependencies detected!\n';
  }

  markdown += `
### 2. Hub Modules (High Coupling)
`;
  for (const hub of stats.hubModules) {
    markdown += `- **${hub.name}**: ${hub.count} outgoing dependencies\n`;
  }

  markdown += `
### 3. Most Depended Upon Modules
`;
  for (const module of stats.mostDepended) {
    markdown += `- **${module.name}**: ${module.count} modules depend on it\n`;
  }

  markdown += `
### 4. Independent Modules (No Dependencies)
`;
  const independentServices: string[] = [];
  const independentUtils: string[] = [];

  for (const [name, module] of dependencyMap) {
    if (module.imports.length === 0) {
      if (name.startsWith('service/')) {
        independentServices.push(name);
      } else {
        independentUtils.push(name);
      }
    }
  }

  if (independentServices.length > 0) {
    markdown += '\n**Services:**\n';
    independentServices.forEach((s) => (markdown += `- ${s}\n`));
  }

  if (independentUtils.length > 0) {
    markdown += '\n**Utilities:**\n';
    independentUtils.forEach((u) => (markdown += `- ${u}\n`));
  }

  markdown += `
## Module Details

### Services

| Service | Imports | Imported By |
|---------|---------|-------------|
`;

  // Add services first
  for (const [name, module] of dependencyMap) {
    if (name.startsWith('service/')) {
      const displayName = name.replace('service/', '');
      const imports =
        module.imports.length > 0
          ? module.imports.map((i) => i.replace('service/', '').replace('utils/', '')).join(', ')
          : '_none_';
      const importedBy =
        module.importedBy.length > 0
          ? module.importedBy.map((i) => i.replace('service/', '').replace('utils/', '')).join(', ')
          : '_none_';
      markdown += `| ${displayName} | ${imports} | ${importedBy} |\n`;
    }
  }

  markdown += `
### Utilities

| Utility | Imports | Imported By |
|---------|---------|-------------|
`;

  // Add utilities
  for (const [name, module] of dependencyMap) {
    if (name.startsWith('utils/')) {
      const displayName = name.replace('utils/', '');
      const imports =
        module.imports.length > 0
          ? module.imports.map((i) => i.replace('service/', '').replace('utils/', '')).join(', ')
          : '_none_';
      const importedBy =
        module.importedBy.length > 0
          ? module.importedBy.map((i) => i.replace('service/', '').replace('utils/', '')).join(', ')
          : '_none_';
      markdown += `| ${displayName} | ${imports} | ${importedBy} |\n`;
    }
  }

  return markdown;
}

// Main execution
function main() {
  console.log('Analyzing dependencies in core package...\n');

  const dependencyMap = buildDependencyMap();
  const circularDeps = detectCircularDependencies(dependencyMap);

  const serviceCount = Array.from(dependencyMap.keys()).filter((k) =>
    k.startsWith('service/')
  ).length;
  const utilCount = Array.from(dependencyMap.keys()).filter((k) => k.startsWith('utils/')).length;

  console.log(`Found ${dependencyMap.size} modules:`);
  console.log(`  - ${serviceCount} services`);
  console.log(`  - ${utilCount} utilities`);
  console.log(`\nFound ${circularDeps.length} circular dependencies`);

  const markdown = generateMarkdown(dependencyMap, circularDeps);

  fs.writeFileSync(OUTPUT_FILE, markdown);
  console.log(`\nDependency diagram written to: ${OUTPUT_FILE}`);

  // Print summary
  if (circularDeps.length > 0) {
    console.log('\nCircular Dependencies:');
    console.log('---------------------');
    for (const cycle of circularDeps) {
      console.log(`  ${cycle.join(' → ')}`);
    }
  }

  // Print most complex modules
  const complexModules = Array.from(dependencyMap.entries())
    .filter(([_, m]) => m.imports.length >= 5)
    .sort((a, b) => b[1].imports.length - a[1].imports.length);

  if (complexModules.length > 0) {
    console.log('\nMost Complex Modules (5+ dependencies):');
    console.log('--------------------------------------');
    for (const [name, module] of complexModules) {
      console.log(`  ${name}: ${module.imports.length} dependencies`);
    }
  }
}

main();
