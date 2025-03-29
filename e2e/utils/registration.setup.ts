import { loginAsTestUser, registerTestUser } from './helper';
import { test as setup } from './loader';

// for user register and login
setup('setup new wallet or login if already registered', async ({ page, extensionId }) => {
  // let playwright know this is going to be slow
  // Wait up to 10 minutes to setup an account
  setup.setTimeout(600000);
  // Create a new page and navigate to extension
  // Navigate and wait for network to be idle
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);

  await page.waitForLoadState('domcontentloaded');

  await page.waitForURL(/.*unlock|.*welcome/);
  const pageUrl = page.url();
  const isUnlockPage = pageUrl.includes('unlock');

  // Create or login using our test user
  if (isUnlockPage) {
    // We're not starting from a fresh install, so login
    await loginAsTestUser({ page, extensionId });
  } else {
    await registerTestUser({ page, extensionId });
  }
});
