import {
  fillInPassword,
  importSenderAccount,
  loginAsTestUser,
  registerTestUser,
} from './utils/helper';
import { getAuth, test, expect } from './utils/loader';

test.beforeAll(async ({ page, extensionId }) => {
  // let playwright know this is going to be slow
  // Wait up to 10 minutes to setup an account
  test.setTimeout(600_000);
  // Create a new page and navigate to extension
  // Navigate and wait for network to be idle
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);

  await page.waitForLoadState('domcontentloaded');

  await page.waitForURL(/.*unlock|.*welcome/);
  const pageUrl = page.url();
  const isWelcomePage = pageUrl.includes('welcome');

  // Create or login using our test user
  if (isWelcomePage) {
    // We're not starting from a fresh install, so login
    await registerTestUser({ page, extensionId });
  }
});

test('Login test', async ({ page, extensionId }) => {
  await loginAsTestUser({ page, extensionId });
});

test('Remove profile test', async ({ page, extensionId }) => {
  const keysFile = await getAuth();

  if (keysFile.password === '') {
    throw new Error('Password is empty in keys file');
  }
  await loginAsTestUser({ page, extensionId });
  await importSenderAccount({ page, extensionId });

  await page.getByLabel('avatar').click();
  await page.getByLabel('avatar').click();
  await page.getByLabel('avatar').click();
  await page.getByRole('button', { name: 'Profile end' }).click();
  await page.getByRole('button', { name: 'Remove Profile' }).click();
  await fillInPassword({ page, password: keysFile.password });
  await page.getByRole('button', { name: 'Remove' }).click();

  // Now login as the test user
  await loginAsTestUser({ page, extensionId });
  // Check that the sender account is not visible
  // switch to the correct account
  await page.getByLabel('menu').click();
  await page.getByRole('button', { name: 'close' }).click();

  expect(await page.getByTestId('profile-item-nickname-sender').count()).toBe(0);
});
