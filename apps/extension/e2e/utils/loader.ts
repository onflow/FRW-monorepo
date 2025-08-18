import base, { type BrowserContext, chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getKeysFilePath = () => {
  return path.join(__dirname, `../../playwright/.auth/keys.json`);
};

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, call) => {
    // In CI, the extension might be in a different location due to artifact download
    let pathToExtension = path.join(__dirname, '../../dist');

    // If we're in CI and the extension doesn't exist at the expected path, try alternative locations
    if (process.env.CI && !fs.existsSync(pathToExtension)) {
      console.log('CI environment detected, checking alternative extension paths...');

      // Try the current working directory + dist
      const cwdDist = path.join(process.cwd(), 'dist');
      if (fs.existsSync(cwdDist)) {
        pathToExtension = cwdDist;
        console.log(`Using extension from CWD: ${pathToExtension}`);
      } else {
        // Try the absolute path from the workspace root
        const workspaceDist = path.join(process.cwd(), 'apps', 'extension', 'dist');
        if (fs.existsSync(workspaceDist)) {
          pathToExtension = workspaceDist;
          console.log(`Using extension from workspace: ${pathToExtension}`);
        }
      }
    }
    // Figure out folder to use
    // Check if setup, test, or teardown
    const projectName = test.info().project.name;
    const projectDependencies = test.info().project.dependencies;
    const isSetup = projectName.match(/.*(setup).*/);
    const isTransaction =
      projectName.includes('transaction-setup') ||
      projectDependencies.includes('transaction-setup');
    const isRegistration =
      projectName.includes('registration-setup') ||
      projectDependencies.includes('registration-setup');

    const baseFolderName = `/tmp/test-user-data-dir-${isTransaction ? 'transaction' : isRegistration ? 'registration' : 'other'}`;
    let dataDir = baseFolderName;
    if (!isSetup) {
      // Copy the base folder to a new folder with the parallel index
      dataDir = `${baseFolderName}-${process.env.TEST_WORKER_INDEX}`;

      fs.cpSync(baseFolderName, dataDir, { recursive: true });
    }

    console.log(`Launching extension for project ${projectName} with data dir ${dataDir}`);
    console.log(`Extension path: ${pathToExtension}`);
    console.log(`Extension directory exists: ${fs.existsSync(pathToExtension)}`);

    if (fs.existsSync(pathToExtension)) {
      const files = fs.readdirSync(pathToExtension);
      console.log(`Extension directory contents: ${files.join(', ')}`);

      const manifestPath = path.join(pathToExtension, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        console.log(`Manifest name: ${manifest.name}, version: ${manifest.version}`);
      } else {
        console.log('Manifest.json not found in extension directory');
      }
    }

    const context = await chromium.launchPersistentContext(dataDir, {
      channel: 'chromium',
      args: [
        '--allow-read-clipboard',
        '--allow-write-clipboard',
        '--lang=en-US',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--enable-automation',
        '--disable-blink-features=AutomationControlled',
        '--enable-extensions',
        '--load-extension=' + pathToExtension,
        '--disable-extensions-except=' + pathToExtension,
      ],
      locale: 'en-US',
      env: {
        ...process.env,
        TEST_MODE: 'true',
        LANGUAGE: 'en_US',
      },
      permissions: ['clipboard-read', 'clipboard-write'],
    });

    // Give the extension time to initialize
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Verify extension is loaded by checking the extensions page
    const page = await context.newPage();
    await page.goto('chrome://extensions/');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      // Enable developer mode if not already enabled
      const devModeToggle = await page.$('#devMode');
      if (devModeToggle) {
        const isChecked = await devModeToggle.isChecked();
        if (!isChecked) {
          console.log('Enabling developer mode...');
          await devModeToggle.click();
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Check for extensions
      const extensionCards = await page.$$('extensions-item');
      console.log(`Extension verification: Found ${extensionCards.length} extensions`);

      if (extensionCards.length === 0) {
        console.log('No extensions found - extension may not be loaded properly');

        // Try to reload the page and check again
        await page.reload();
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const extensionCardsAfter = await page.$$('extensions-item');
        console.log(`Extensions after reload: ${extensionCardsAfter.length}`);
      }
    } catch (err) {
      console.log(`Error verifying extension: ${err.message}`);
    }

    await page.close();

    await call(context);
    await context.close();
  },
  extensionId: async ({ context }, call) => {
    // Alternative approach: try to get extension ID from a page first
    let extensionId: string | null = null;

    // Method 1: Try service worker approach
    let [background] = context.serviceWorkers();
    console.log(`Initial service workers: ${context.serviceWorkers().length}`);

    if (background) {
      extensionId = background.url().split('/')[2];
      console.log(`Extension ID from service worker: ${extensionId}`);
    } else {
      // Wait a bit more for service worker to start
      await new Promise((resolve) => setTimeout(resolve, 2000));
      [background] = context.serviceWorkers();
      if (background) {
        extensionId = background.url().split('/')[2];
        console.log(`Extension ID from service worker after wait: ${extensionId}`);
      }
    }

    if (!extensionId) {
      // Method 2: Try creating a page to trigger extension loading
      try {
        console.log('Trying to load extension popup to get ID...');
        const extensionPages = context.pages();
        console.log(`Current pages: ${extensionPages.length}`);

        // Create a new tab to potentially trigger extension initialization
        const page = await context.newPage();
        await page.goto('chrome://extensions/');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Try to trigger the extension service worker by opening background page
        try {
          const testExtensionId =
            process.env.TEST_EXTENSION_ID || 'cfiagdgiikmjgfjnlballglniejjgegi';

          // Try to open the background page first
          await page.goto(`chrome-extension://${testExtensionId}/background.html`);
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Check for service worker again
          [background] = context.serviceWorkers();
          if (background) {
            extensionId = background.url().split('/')[2];
            console.log(`Extension ID from background page trigger: ${extensionId}`);
          } else {
            // Try popup as fallback
            await page.goto(`chrome-extension://${testExtensionId}/popup.html`);
            await new Promise((resolve) => setTimeout(resolve, 2000));

            [background] = context.serviceWorkers();
            if (background) {
              extensionId = background.url().split('/')[2];
              console.log(`Extension ID from popup trigger: ${extensionId}`);
            }
          }
        } catch (err) {
          console.log(`Error triggering extension: ${err.message}`);
        }

        // Try to get extension ID from chrome://extensions page
        try {
          const extensionCards = await page.$$('extensions-item');
          console.log(`Found ${extensionCards.length} extension cards`);

          for (const card of extensionCards) {
            const idAttr = await card.getAttribute('id');
            if (idAttr) {
              extensionId = idAttr;
              console.log(`Extension ID from chrome://extensions: ${extensionId}`);
              break;
            }
          }
        } catch (err) {
          console.log(`Error reading extensions page: ${err.message}`);
        }

        // Also try to directly access the extension popup
        if (!extensionId) {
          try {
            // Navigate to extension management to find ID
            const extensionElements = await page.$$eval('extensions-item', (elements) => {
              return elements.map((el) => ({
                id: el.getAttribute('id'),
                name: el.querySelector('.name')?.textContent,
              }));
            });
            console.log('Extensions found:', extensionElements);

            const flowWallet = extensionElements.find(
              (ext) => ext.name && ext.name.toLowerCase().includes('flow')
            );

            if (flowWallet && flowWallet.id) {
              extensionId = flowWallet.id;
              console.log(`Flow Wallet extension ID: ${extensionId}`);
            }
          } catch (err) {
            console.log(`Error finding extension in list: ${err.message}`);
          }
        }

        // Try service worker again
        [background] = context.serviceWorkers();
        console.log(`Service workers after page creation: ${context.serviceWorkers().length}`);

        if (background) {
          extensionId = background.url().split('/')[2];
        } else {
          // Method 3: Wait for service worker event
          try {
            console.log('Waiting for service worker event...');
            background = await context.waitForEvent('serviceworker', { timeout: 30000 });
            console.log(`Service worker found via event: ${background.url()}`);
            extensionId = background.url().split('/')[2];
          } catch (error) {
            console.log(`Service worker event timeout: ${error.message}`);

            // Method 4: Try to extract from any extension page URLs
            const allPages = context.pages();
            for (const pg of allPages) {
              const url = pg.url();
              if (url.startsWith('chrome-extension://')) {
                extensionId = url.split('/')[2];
                console.log(`Extension ID from page URL: ${extensionId}`);
                break;
              }
            }
          }
        }
      } catch (err) {
        console.log(`Error in alternative approach: ${err.message}`);
      }
    }

    if (!extensionId) {
      // Final debugging
      const pages = context.pages();
      const workers = context.serviceWorkers();
      console.log(`Debug info - Pages: ${pages.length}, Workers: ${workers.length}`);
      for (const page of pages) {
        console.log(`Page URL: ${page.url()}`);
      }
      for (const worker of workers) {
        console.log(`Worker URL: ${worker.url()}`);
      }

      // Use fallback extension ID (hardcoded from manifest key)
      const fallbackId = process.env.TEST_EXTENSION_ID || 'cfiagdgiikmjgfjnlballglniejjgegi';
      console.log(`TEST_EXTENSION_ID env var: ${process.env.TEST_EXTENSION_ID}`);
      if (!process.env.TEST_EXTENSION_ID) {
        console.log(`No fallback extension ID available in env vars`);
      }
      console.log(`Using fallback extension ID: ${fallbackId}`);
      extensionId = fallbackId;
    }

    console.log(`Final extension ID: ${extensionId}`);
    await call(extensionId);
  },
});

export const cleanExtension = async (projectName: string) => {
  console.log(
    'Cleaning extension for - parallel index, worker index, project',
    process.env.TEST_PARALLEL_INDEX,
    process.env.TEST_WORKER_INDEX,
    process.env.TEST_PROJECT
  );

  const userDataDir = `/tmp/test-user-data-dir-${projectName}`;
  const baseDir = '/tmp';

  // Read all directories in /tmp
  const files = fs.readdirSync(baseDir);

  // Find and remove all directories that match the pattern
  files.forEach((file) => {
    const fullPath = path.join(baseDir, file);
    if (file.startsWith(`test-user-data-dir-${projectName}`) && fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  });
};

// save keys auth file

export const saveAuth = async (auth) => {
  const keysFilePath = getKeysFilePath();

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
  const keysFilePath = getKeysFilePath();
  const keysFileContent = fs.existsSync(keysFilePath)
    ? fs.readFileSync(keysFilePath, 'utf8')
    : null;
  const keysFile = keysFileContent ? JSON.parse(keysFileContent) : null;
  return keysFile || { password: '', addr: '', nickname: '' };
};
// delete keys file

export const cleanAuth = async () => {
  await saveAuth(null);
};

export const expect = test.expect;
