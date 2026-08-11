/**
 * Extension release initiation script (#1434).
 *
 * The CD pipeline (.github/workflows/extension-release.yml) owns the build,
 * store upload/publish, and GitHub release. This script only *initiates* a
 * release: it bumps apps/extension/package.json on a release branch and opens
 * a PR. After the PR merges, cut the tag it prints at the end.
 *
 * Usage:
 *   pnpm pub <x.y.z>           # bump + branch + PR
 *   pnpm pub <x.y.z> --dry-run # print actions without touching git
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const PACKAGE_JSON_PATH = path.resolve(PROJECT_ROOT, 'package.json');

const SEMVER = /^\d+\.\d+\.\d+$/;

const dryRun = process.argv.includes('--dry-run');
const version = process.argv.find((arg) => SEMVER.test(arg));

const fail = (message: string): never => {
  console.error(`❌ ${message}`);
  process.exit(1);
};

if (!version) {
  fail('Usage: pnpm pub <x.y.z> [--dry-run]');
}

const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
const currentVersion: string = packageJson.version;

const toTuple = (v: string) => v.split('.').map(Number);
const [newMajor, newMinor, newPatch] = toTuple(version);
const [curMajor, curMinor, curPatch] = toTuple(currentVersion);
const isNewer =
  newMajor > curMajor ||
  (newMajor === curMajor && newMinor > curMinor) ||
  (newMajor === curMajor && newMinor === curMinor && newPatch > curPatch);

if (!isNewer) {
  fail(`Version ${version} must be greater than the current ${currentVersion}.`);
}

const branch = `release/ext-${version}`;
const tag = `release/ext-${version}`;

const run = (command: string, args: string[]) => {
  console.log(`+ ${command} ${args.join(' ')}`);
  if (!dryRun) {
    execFileSync(command, args, { stdio: 'inherit' });
  }
};

console.log(`\nReleasing extension ${currentVersion} → ${version}${dryRun ? ' (dry run)' : ''}\n`);

run('git', ['checkout', '-b', branch]);

packageJson.version = version;
if (dryRun) {
  console.log(`+ write ${PACKAGE_JSON_PATH} (version = ${version})`);
} else {
  fs.writeFileSync(PACKAGE_JSON_PATH, `${JSON.stringify(packageJson, null, 2)}\n`);
}

run('git', ['add', PACKAGE_JSON_PATH]);
run('git', ['commit', '-m', `chore(release): extension ${version}`]);
run('git', ['push', '-u', 'origin', branch]);
run('gh', [
  'pr',
  'create',
  '--title',
  `chore(release): extension ${version}`,
  '--body',
  `Version bump to ${version} for the Chrome Web Store release.\n\nAfter merging, cut the release tag on \`dev\`:\n\n\`\`\`bash\ngit fetch origin dev\ngit tag ${tag} origin/dev\ngit push origin ${tag}\n\`\`\`\n\nThe Extension Store Release workflow builds, uploads, and (after the chrome-webstore environment approval) publishes, then creates the GitHub release.`,
]);

console.log(`
✅ Release PR opened for ${version}.

Next steps:
  1. Merge the PR.
  2. git fetch origin dev
  3. git tag ${tag} origin/dev
  4. git push origin ${tag}
  5. Approve the chrome-webstore publish gate in the workflow run.
`);
