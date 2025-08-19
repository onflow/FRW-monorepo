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

    // Use system Chrome in CI, Chromium locally
    const browserOptions = {
      headless: process.env.HEADLESS === 'true',
      channel: process.env.CI ? 'chrome' : 'chromium',
      executablePath: process.env.CI ? '/usr/bin/google-chrome' : undefined,
      args: [
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--lang=en-US',
        '--allow-read-clipboard',
        '--allow-write-clipboard',
        `--load-extension=${path.resolve(pathToExtension)}`,
        `--disable-extensions-except=${path.resolve(pathToExtension)}`,
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-extensions-file-access-check',
        '--disable-extensions-http-throttling',
        '--enable-automation',
        '--disable-blink-features=AutomationControlled',
        // Extension loading specific args
        '--enable-extensions',
        '--disable-extensions-unsupported-policy',
        '--allow-running-insecure-content',
        '--disable-popup-blocking',
        '--disable-default-apps',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-sync',
        '--allow-insecure-localhost',
        // Force enable service workers and extensions
        '--enable-service-worker-script-cache',
        '--force-enable-extensions',
        // Critical args to fix ERR_BLOCKED_BY_CLIENT
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-background-timer-throttling',
        '--disable-client-side-phishing-detection',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--disable-domain-reliability',
        '--disable-extensions-http-throttling',
        '--disable-features=InterestFeedContentSuggestions',
        '--disable-hang-monitor',
        '--disable-prompt-on-repost',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-background-timer-throttling',
        '--allow-pre-commit-input',
        '--disable-background-networking',
      ],
      locale: 'en-US',
      env: {
        ...process.env,
        TEST_MODE: 'true',
        LANGUAGE: 'en_US',
      },
      permissions: ['clipboard-read', 'clipboard-write'],
      // Increase timeout for extension loading
      timeout: process.env.CI ? 120000 : 60000,
    };

    const context = await chromium.launchPersistentContext(dataDir, browserOptions);

    // Give the extension more time to initialize in CI
    const initDelay = process.env.CI ? 10000 : 5000;
    console.log(`Waiting ${initDelay}ms for extension initialization...`);
    await new Promise((resolve) => setTimeout(resolve, initDelay));

    // CI-specific extension loading workaround
    if (process.env.CI) {
      console.log('CI environment detected, using enhanced extension loading strategy...');

      try {
        // In CI, we need to be more aggressive about triggering extension loading
        const page = await context.newPage();
        const testExtensionId = process.env.TEST_EXTENSION_ID || 'cfiagdgiikmjgfjnlballglniejjgegi';

        // Method 1: Try to enable developer mode and trigger extension loading
        try {
          await page.goto('chrome://extensions/');
          await new Promise((resolve) => setTimeout(resolve, 3000));

          // Try to trigger developer mode (if possible)
          await page
            .evaluate(() => {
              const devModeToggle = document.querySelector('#devMode');
              if (devModeToggle && !devModeToggle.checked) {
                devModeToggle.click();
              }
            })
            .catch(() => {
              console.log('Could not toggle developer mode');
            });

          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (err) {
          console.log(`Error accessing chrome://extensions: ${err.message}`);
        }

        // Method 2: Wait for service worker without direct navigation (avoid ERR_BLOCKED_BY_CLIENT)
        console.log('Waiting for extension service worker to auto-start...');
        let waitAttempts = 0;
        const maxWaitAttempts = 15; // Wait up to 30 seconds

        while (waitAttempts < maxWaitAttempts) {
          const workers = context.serviceWorkers();
          if (workers.length > 0) {
            console.log(`✓ Service worker auto-started after ${waitAttempts * 2}s`);
            break;
          }
          console.log(
            `Waiting for service worker... attempt ${waitAttempts + 1}/${maxWaitAttempts}`
          );
          await new Promise((resolve) => setTimeout(resolve, 2000));
          waitAttempts++;
        }

        // Final check for service workers
        const finalWorkers = context.serviceWorkers();
        if (finalWorkers.length === 0) {
          console.log(
            '⚠️ Service worker did not start automatically, extension may not be properly loaded'
          );
          console.log('This might be due to Chrome security restrictions in CI environment');

          // One last attempt - try to trigger via browser action click simulation
          try {
            console.log('Trying to simulate browser action trigger...');
            await page.evaluate(() => {
              // Simulate clicking on the extension icon area
              const event = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
              });
              document.dispatchEvent(event);
            });
            await new Promise((resolve) => setTimeout(resolve, 3000));
          } catch (err) {
            console.log(`Browser action simulation failed: ${err.message}`);
          }
        } else {
          console.log(`✓ Found ${finalWorkers.length} service worker(s)`);
        }

        await page.close();
      } catch (err) {
        console.log(`Error in CI extension loading: ${err.message}`);
      }
    } else {
      // Local development extension loading
      try {
        const page = await context.newPage();
        const testExtensionId = process.env.TEST_EXTENSION_ID || 'cfiagdgiikmjgfjnlballglniejjgegi';

        await page.goto(`chrome-extension://${testExtensionId}/popup.html`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await page.close();
      } catch (err) {
        console.log(`Error in local extension loading: ${err.message}`);
      }
    }

    // Final wait for service worker initialization
    await new Promise((resolve) => setTimeout(resolve, process.env.CI ? 5000 : 3000));

    await call(context);
    await context.close();
  },
  extensionId: async ({ context }, call) => {
    let extensionId: string | null = null;

    // Method 1: Try service worker approach with retries
    const maxRetries = 5;
    let attempts = 0;

    while (attempts < maxRetries && !extensionId) {
      const workers = context.serviceWorkers();
      console.log(`Attempt ${attempts + 1}: Found ${workers.length} service workers`);

      if (workers.length > 0) {
        const [background] = workers;
        extensionId = background.url().split('/')[2];
        console.log(`Extension ID from service worker: ${extensionId}`);
        break;
      }

      attempts++;
      if (attempts < maxRetries) {
        console.log(`No service workers found, waiting ${2000 * attempts}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempts));
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

        // Try to trigger the extension service worker by opening extension pages
        const testExtensionId = process.env.TEST_EXTENSION_ID || 'cfiagdgiikmjgfjnlballglniejjgegi';
        const extensionUrls = [
          `chrome-extension://${testExtensionId}/popup.html`,
          `chrome-extension://${testExtensionId}/index.html`,
          `chrome-extension://${testExtensionId}/notification.html`,
        ];

        for (const url of extensionUrls) {
          try {
            console.log(`Trying to load: ${url}`);
            await page.goto(url);
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Check for service worker after each attempt
            const workers = context.serviceWorkers();
            if (workers.length > 0) {
              const [background] = workers;
              extensionId = background.url().split('/')[2];
              console.log(`Extension ID from ${url}: ${extensionId}`);
              break;
            }

            // Also check if we're on a valid extension page
            const currentUrl = page.url();
            if (
              currentUrl.startsWith('chrome-extension://') &&
              !currentUrl.includes('chrome-error://')
            ) {
              extensionId = currentUrl.split('/')[2];
              console.log(`Extension ID from valid page URL ${currentUrl}: ${extensionId}`);
              break;
            }
          } catch (err) {
            console.log(`Error loading ${url}: ${err.message}`);
            continue;
          }
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
