import fs from 'fs/promises';
import path from 'path';

import JSZip from 'jszip';

async function loadSecrets() {
  const secrets = new Set<string>();
  const projectRoot = process.cwd();
  console.log(`Searching for .env files in: ${projectRoot}`);
  try {
    const files = await fs.readdir(projectRoot);
    const envFiles = files.filter((file) => file === '.env' || file.startsWith('.env.'));
    console.log(`Found .env files: ${envFiles.join(', ') || 'None'}`);

    for (const file of envFiles) {
      console.log(`Loading secrets from ${file}`);
      const content = await fs.readFile(path.join(projectRoot, file), 'utf-8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.startsWith('#') || !line.includes('=')) {
          continue;
        }
        const parts = line.split('=');
        let value = parts.slice(1).join('=').trim();
        // Remove quotes from the value
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.substring(1, value.length - 1);
        }
        if (value) {
          secrets.add(value);
        }
      }
    }
    const loadedSecrets = Array.from(secrets);
    console.log(`Loaded ${loadedSecrets.length} secrets.`);
    if (loadedSecrets.length > 0) {
      console.log('Loaded secrets:', loadedSecrets);
    }
  } catch (error) {
    console.warn('Could not load .env files. Continuing without them.', error);
  }
  return Array.from(secrets);
}

function scrubValue(obj: any, secrets: string[], objectPath = '') {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const currentPath = objectPath ? `${objectPath}.${key}` : key;
      const value = obj[key];
      if (typeof value === 'string') {
        if (secrets.includes(value)) {
          console.log(`Sanitizing exact match at path: ${currentPath}`);
          obj[key] = '********';
        } else {
          // Check for partial matches for debugging purposes
          for (const secret of secrets) {
            // Ensure secret is not an empty string and is found in the value
            if (secret && value.includes(secret)) {
              console.log(
                `[DEBUG] Potential partial match found at path '${currentPath}'. The script does not scrub partial matches by default.`
              );
              console.log(`[DEBUG]   Secret: '${secret}'`);
              console.log(`[DEBUG]   Value:  '${value}'`);
            }
          }
        }
      } else {
        scrubValue(value, secrets, currentPath); // Pass path down in recursion
      }
    }
  }
}

async function sanitizeTrace(tracePath: string, secrets: string[]) {
  if (!(await fs.stat(tracePath).catch(() => false))) {
    console.error(`Trace file not found: ${tracePath}`);
    return;
  }

  console.log(`\n--- Sanitizing trace: ${path.basename(tracePath)} ---`);

  const zipData = await fs.readFile(tracePath);
  const zip = await JSZip.loadAsync(zipData);

  console.log(`Files inside ${path.basename(tracePath)}:`);
  Object.keys(zip.files).forEach((filename) => {
    console.log(`- ${filename}`);
  });

  const traceFiles = Object.values(zip.files).filter((f) => f.name.endsWith('.trace'));

  if (traceFiles.length === 0) {
    console.error(`No .trace files found in ${path.basename(tracePath)}.`);
    return;
  }

  console.log(`Found ${traceFiles.length} trace file(s) to sanitize.`);

  for (const traceFile of traceFiles) {
    console.log(`Sanitizing: ${traceFile.name}`);
    const traceContent = await traceFile.async('string');
    const lines = traceContent.split('\n');

    const sensitiveKeywords = /password|secret|token/i;
    const sanitizedLines = lines.map((line) => {
      try {
        if (line.trim() === '') {
          return line;
        }
        const event = JSON.parse(line);
        // Legacy sanitization based on selector
        if (
          event.type === 'before' &&
          event.params &&
          event.params.selector &&
          sensitiveKeywords.test(event.params.selector)
        ) {
          if ('value' in event.params) {
            console.log(`Sanitizing value for selector: ${event.params.selector}`);
            event.params.value = '********';
          }
          if ('text' in event.params) {
            console.log(`Sanitizing text for selector: ${event.params.selector}`);
            event.params.text = '********';
          }
        }
        // Sanitize any value from .env files
        scrubValue(event, secrets);
        return JSON.stringify(event);
      } catch (e) {
        // Not a valid JSON line, return it as is
        return line;
      }
    });

    const sanitizedTraceContent = sanitizedLines.join('\n');
    zip.file(traceFile.name, sanitizedTraceContent);
  }

  const newZipData = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6,
    },
  });

  await fs.writeFile(tracePath, newZipData);

  console.log(`Sanitization complete: ${tracePath}`);
}

async function sanitizeAllTraces() {
  const baseDir = path.resolve(process.argv[2] || 'playwright-report');
  const dataDir = path.join(baseDir, 'data');
  const secrets = await loadSecrets();

  if (!(await fs.stat(dataDir).catch(() => false))) {
    console.error(`Data directory not found: ${dataDir}`);
    console.error('Please provide a valid Playwright report directory.');
    process.exit(1);
  }

  const files = await fs.readdir(dataDir);
  const zipFiles = files.filter((file) => file.endsWith('.zip'));

  if (zipFiles.length === 0) {
    console.log('No .zip files found to sanitize.');
    return;
  }

  console.log(`\nFound ${zipFiles.length} zip file(s) to process in ${dataDir}`);

  for (const zipFile of zipFiles) {
    const fullPath = path.join(dataDir, zipFile);
    await sanitizeTrace(fullPath, secrets);
  }
}

sanitizeAllTraces().catch((err) => {
  console.error('An error occurred during trace sanitization:', err);
});
