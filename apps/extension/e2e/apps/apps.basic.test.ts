import { connectToApps, loginToSenderAccount } from '../utils/helper';
import { test, expect } from '../utils/loader';

test.beforeEach(async ({ page, extensionId }) => {
  // Login to our sender account
  await loginToSenderAccount({ page, extensionId });
});

test('Verify connect with wallet', async ({ page, extensionId }) => {
  test.slow();
  const nickname = process.env.TEST_SENDER_NICKNAME || 'Sender';
  const address = process.env.TEST_SENDER_ADDR || 'Unknown Address';
  const evmAddress = process.env.TEST_SENDER_EVM_ADDR || 'Unknown EVM Address';
  console.log(`Starting balance check for Sender: ${nickname} (${address})`);

  // Login to sender account
  await connectToApps({
    page,
    extensionId,
    url: 'https://flow-evm-dapp.vercel.app/',
    testId: 'rk-connect-button',
    idx: 0,
  });

  const flowBtn = await page.getByTestId('rk-wallet-option-com.flowfoundation.wallet');
  expect(flowBtn).toBeVisible();

  // page.on('popup', async (popupPage) => {

  //   console.log(popupPage);
  //   const changeAccBtn = await popupPage.getByTestId('account-card-chevron');
  //   expect(changeAccBtn).toBeVisible();

  //   changeAccBtn.click();
  // });

  await flowBtn.click();
  // await captureExtensionPage();

  // await page.getByText('Flow Wallet').click();

  // await page.getByTestId('connect-button').click();

  // const flowNetStr = await page.getByText('Flow EVM Mainnet');
  // const flowEoaAddr = await page.getByText('0x00…0CA0');

  // expect(flowNetStr).toBeVisible();
  // expect(flowEoaAddr).toBeVisible();

  // // Assert based on the overall result
  // expect(
  //   overallSufficient,
  //   `One or more token balances are insufficient for ${nickname} (${address}). See attached report.`
  // ).toBeTruthy();

  console.log(`Sender (${nickname}) balance verification complete.`);
});
