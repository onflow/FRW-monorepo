import fs from 'fs';
import path from 'path';

import base, { type BrowserContext, chromium } from '@playwright/test';

const getKeysFilePath = (workerIndex: string | number | undefined) => {
  if (!workerIndex) {
    throw new Error('TEST_PARALLEL_INDEX is not set');
  }
  return path.join(import.meta.dirname, `../../playwright/.auth/keys-${workerIndex}.json`);
};

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, call) => {
    const pathToExtension = path.join(import.meta.dirname, '../../dist');
    const context = await chromium.launchPersistentContext(
      `/tmp/test-user-data-dir-${process.env.TEST_PARALLEL_INDEX}`,
      {
        channel: 'chromium',
        args: [
          `--disable-extensions-except=${pathToExtension}`,
          `--load-extension=${pathToExtension}`,
          '--allow-read-clipboard',
          '--allow-write-clipboard',
        ],
        env: {
          ...process.env,
          TEST_MODE: 'true',
        },
        permissions: ['clipboard-read', 'clipboard-write'],
      }
    );

    await call(context);
    await context.close();
  },
  extensionId: async ({ context }, call) => {
    // for manifest v3:
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent('serviceworker');
    const extensionId = background.url().split('/')[2];
    await call(extensionId);
  },
});

export const cleanExtension = async () => {
  console.log(
    'Cleaning extension for - parallel index, worker index, project',
    process.env.TEST_PARALLEL_INDEX,
    process.env.TEST_WORKER_INDEX,
    process.env.TEST_PROJECT
  );

  const userDataDir = `/tmp/test-user-data-dir-${process.env.TEST_PARALLEL_INDEX}`;
  if (fs.existsSync(userDataDir)) {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }
};

// save keys auth file

export const saveAuth = async (auth) => {
  const keysFilePath = getKeysFilePath(process.env.TEST_PARALLEL_INDEX);

  if (auth) {
    // Ensure directory exists

    const dirPath = path.dirname(keysFilePath);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(keysFilePath, JSON.stringify(auth));
  } else {
    if (fs.existsSync(keysFilePath)) {
      fs.unlinkSync(keysFilePath);
    }
  }
};
// get keys auth file

export const getAuth = async () => {
  const keysFilePath = getKeysFilePath(process.env.TEST_PARALLEL_INDEX);
  const keysFileContent = fs.existsSync(keysFilePath)
    ? fs.readFileSync(keysFilePath, 'utf8')
    : null;
  const keysFile = keysFileContent ? JSON.parse(keysFileContent) : null;
  return keysFile || { password: '', addr: '' };
};
// delete keys file

export const cleanAuth = async () => {
  await saveAuth(null);
};
