import {
  switchToEvm,
  switchAccount,
  importAccountBySeedPhrase,
  registerTestUser,
  loginAsTestUser,
} from './utils/helper';
import { test, expect } from './utils/loader';

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

test('check main account address after switching', async ({ page, extensionId }) => {
  // Import profile  with multiple accounts
  await importAccountBySeedPhrase({
    page,
    extensionId,
    seedPhrase: process.env.TEST_SEED_PHRASE_MULTI_ACCOUNT_TESTER,
    username: process.env.TEST_MULTI_ACCOUNT_TESTER_NICKNAME!,
    accountAddr: process.env.TEST_MULTI_ACCOUNT_TESTER_ADDR1!,
  });
  //Check main account 1 Flow address
  const mainAccAddress = page
    .getByTestId('copy-address-button')
    .filter({ hasText: process.env.TEST_MULTI_ACCOUNT_TESTER_ADDR1! });

  await expect(mainAccAddress).toBeVisible({
    timeout: 60_000,
  });
  //Check main account 1 EVM address
  await switchToEvm({ page, extensionId });
  const mainAccEvmAddress = page.getByTestId('copy-address-button').filter({ hasText: 'ae07968a' });

  await expect(mainAccEvmAddress).toBeVisible({
    timeout: 60_000,
  });
  //Switch from account 1 to account 2
  await switchAccount({ page, extensionId });
  const switchedAccAddress = page
    .getByTestId('copy-address-button')
    .filter({ hasText: process.env.TEST_MULTI_ACCOUNT_TESTER_ADDR2! });
  //Check main account 2 Flow address
  await expect(switchedAccAddress).toBeVisible({
    timeout: 60_000,
  });
  //Check main account 2 EVM address
  await switchToEvm({ page, extensionId });
  const switchedAccEvmAddress = page
    .getByTestId('copy-address-button')
    .filter({ hasText: 'b0757199' });

  await expect(switchedAccEvmAddress).toBeVisible({
    timeout: 60_000,
  });
});
