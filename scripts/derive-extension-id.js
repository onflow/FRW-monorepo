#!/usr/bin/env node

/**
 * Derive the Chrome extension ID from a manifest key.
 * Usage:
 *   pnpm node scripts/derive-extension-id.js [/path/to/manifest.json]
 *   pnpm node scripts/derive-extension-id.js --key "$MANIFEST_KEY"
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
let manifestPath = path.resolve(__dirname, '../apps/extension/_raw/manifest.json');
let manifestKey = undefined;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--key') {
    manifestKey = args[i + 1];
    i += 1;
    continue;
  }
  manifestPath = path.resolve(process.cwd(), arg);
}

if (!manifestKey) {
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found at ${manifestPath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifestKey = manifest.key;
}

if (!manifestKey) {
  console.error('Manifest key is missing');
  process.exit(1);
}

const publicKey = Buffer.from(manifestKey, 'base64');
const hash = crypto.createHash('sha256').update(publicKey).digest();
const alphabet = 'abcdefghijklmnop';

let extensionId = '';
for (let i = 0; i < 16; i++) {
  const byte = hash[i];
  extensionId += alphabet[byte >> 4];
  extensionId += alphabet[byte & 0x0f];
}

console.log(extensionId);
