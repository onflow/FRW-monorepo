import { loginToSenderAccount, switchToMainAccount } from '../utils/helper';
import { test, expect, wait } from '../utils/loader';

const inboxAcctAddr = process.env.TEST_INBOX_ADDR || '0x7fa3cdbd8d049409';
console.log(`Inbox address: ${inboxAcctAddr}`);

test.beforeEach(async ({ page, extensionId }) => {
  await loginToSenderAccount({ page, extensionId });
  await switchToMainAccount({ page, address: inboxAcctAddr });
});

test('Verify inbox screen opens and displays elements', async ({ page, extensionId }) => {
  test.slow();

  // Navigate to dashboard and click inbox button
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard`);
  await page.waitForURL(/.*\/dashboard.*/);
  await wait(2000);

  // Click inbox button to navigate to claim tokens screen
  const inboxButton = page.getByTestId('inbox-button');
  await expect(inboxButton).toBeVisible({ timeout: 30_000 });
  await inboxButton.click();

  // Wait for the claim tokens screen to load
  await page.waitForURL(/.*\/claimtokens.*/);
  await wait(2000);

  // Verify the claim tokens screen is visible
  const claimScreen = page.getByTestId('claim-tokens-screen');
  await expect(claimScreen).toBeVisible({ timeout: 30_000 });

  // Verify the tab control is present
  const tabControl = page.getByTestId('claim-tab-control');
  await expect(tabControl).toBeVisible();

  // Verify Tokens tab is visible (first segment)
  const tokensTab = page.getByTestId('segment-0');
  await expect(tokensTab).toBeVisible();

  // Verify NFTs tab is visible (second segment)
  const nftsTab = page.getByTestId('segment-1');
  await expect(nftsTab).toBeVisible();
});

test('Verify FT token list on inbox screen', async ({ page, extensionId }) => {
  test.slow();

  // Navigate directly to claim tokens screen
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard/claimtokens`);
  await page.waitForURL(/.*\/claimtokens.*/);
  await wait(3000);

  // Wait for loading to finish (either items appear or empty state)
  const claimScreen = page.getByTestId('claim-tokens-screen');
  await expect(claimScreen).toBeVisible({ timeout: 30_000 });

  // Check that loading skeleton disappears
  const loading = page.getByTestId('claim-loading');
  await expect(loading).not.toBeVisible({ timeout: 30_000 });

  // Tokens tab should be active by default — check for FT items or empty state
  const ftItems = page.locator('[data-testid^="claim-ft-item-"]');
  const emptyState = page.getByTestId('claim-empty');

  // Either FT items exist or the empty state is shown
  const hasFtItems = await ftItems.count();
  if (hasFtItems > 0) {
    // Verify at least one FT row is visible
    await expect(ftItems.first()).toBeVisible();

    // Verify FT rows contain the inner row component
    const ftRows = page.locator('[data-testid^="claim-ft-row-"]');
    await expect(ftRows.first()).toBeVisible();
  } else {
    await expect(emptyState).toBeVisible();
  }
});

test('Verify NFT tab selection shows NFT items', async ({ page, extensionId }) => {
  test.slow();

  // Navigate directly to claim tokens screen
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard/claimtokens`);
  await page.waitForURL(/.*\/claimtokens.*/);
  await wait(3000);

  // Wait for screen to load
  const claimScreen = page.getByTestId('claim-tokens-screen');
  await expect(claimScreen).toBeVisible({ timeout: 30_000 });

  const loading = page.getByTestId('claim-loading');
  await expect(loading).not.toBeVisible({ timeout: 30_000 });

  // Click NFTs tab (second segment)
  const nftsTab = page.getByTestId('segment-1');
  await expect(nftsTab).toBeVisible();
  await nftsTab.click();
  await wait(1000);

  // Check for NFT items or empty state
  const nftItems = page.locator('[data-testid^="claim-nft-item-"]');
  const emptyState = page.getByTestId('claim-empty');

  const hasNftItems = await nftItems.count();
  if (hasNftItems > 0) {
    // Verify at least one NFT collection row is visible
    await expect(nftItems.first()).toBeVisible();

    // Verify NFT collection rows contain the inner row component
    const nftRows = page.locator('[data-testid^="claim-nft-row-"]');
    await expect(nftRows.first()).toBeVisible();
  } else {
    await expect(emptyState).toBeVisible();
  }

  // Switch back to Tokens tab to verify tab switching works both ways
  const tokensTab = page.getByTestId('segment-0');
  await tokensTab.click();
  await wait(500);
});

test('Verify claim drawer opens from FT token detail', async ({ page, extensionId }) => {
  test.slow();

  // Navigate directly to claim tokens screen
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard/claimtokens`);
  await page.waitForURL(/.*\/claimtokens.*/);
  await wait(3000);

  // Wait for screen and loading to finish
  const claimScreen = page.getByTestId('claim-tokens-screen');
  await expect(claimScreen).toBeVisible({ timeout: 30_000 });

  const loading = page.getByTestId('claim-loading');
  await expect(loading).not.toBeVisible({ timeout: 30_000 });

  // Find FT items
  const ftItems = page.locator('[data-testid^="claim-ft-item-"]');
  const ftCount = await ftItems.count();

  // Skip test if no FT items available
  test.skip(ftCount === 0, 'No FT items available in inbox to test claim drawer');

  // Click the first FT item to navigate to detail screen
  await ftItems.first().click();
  await page.waitForURL(/.*\/claimDetail.*/);
  await wait(2000);

  // Verify claim and reject buttons are visible on detail screen
  const claimButton = page.getByTestId('claim-detail-claim');
  const rejectButton = page.getByTestId('claim-detail-reject');

  await expect(claimButton).toBeVisible({ timeout: 15_000 });
  await expect(rejectButton).toBeVisible();

  // Click claim button to open the drawer
  await claimButton.click();
  await wait(1000);

  // Verify the claim drawer is visible
  const claimDrawer = page.getByTestId('claim-drawer');
  await expect(claimDrawer).toBeVisible({ timeout: 10_000 });

  // Verify drawer has close button and confirm button
  const closeButton = page.getByTestId('claim-drawer-close');
  const confirmButton = page.getByTestId('claim-drawer-confirm');

  await expect(closeButton).toBeVisible();
  await expect(confirmButton).toBeVisible();

  // Close the drawer
  await closeButton.click();
  await wait(500);
});

test('Verify claim drawer opens from NFT collection detail', async ({ page, extensionId }) => {
  test.slow();

  // Navigate directly to claim tokens screen
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard/claimtokens`);
  await page.waitForURL(/.*\/claimtokens.*/);
  await wait(3000);

  // Wait for screen to load
  const claimScreen = page.getByTestId('claim-tokens-screen');
  await expect(claimScreen).toBeVisible({ timeout: 30_000 });

  const loading = page.getByTestId('claim-loading');
  await expect(loading).not.toBeVisible({ timeout: 30_000 });

  // Switch to NFTs tab
  const nftsTab = page.getByTestId('segment-1');
  await nftsTab.click();
  await wait(1000);

  // Find NFT items
  const nftItems = page.locator('[data-testid^="claim-nft-item-"]');
  const nftCount = await nftItems.count();

  // Skip test if no NFT items available
  test.skip(nftCount === 0, 'No NFT items available in inbox to test claim drawer');

  // Click the first NFT collection to navigate to detail screen
  await nftItems.first().click();
  await page.waitForURL(/.*\/claimDetail.*/);
  await wait(2000);

  // Verify claim button is visible on NFT detail screen
  const claimButton = page.getByTestId('claim-detail-claim');
  await expect(claimButton).toBeVisible({ timeout: 15_000 });

  // Click claim button to open the drawer
  await claimButton.click();
  await wait(1000);

  // Verify the claim drawer is visible
  const claimDrawer = page.getByTestId('claim-drawer');
  await expect(claimDrawer).toBeVisible({ timeout: 10_000 });

  // Verify drawer has close button and confirm button
  const closeButton = page.getByTestId('claim-drawer-close');
  const confirmButton = page.getByTestId('claim-drawer-confirm');

  await expect(closeButton).toBeVisible();
  await expect(confirmButton).toBeVisible();

  // Close the drawer
  await closeButton.click();
  await wait(500);
});
