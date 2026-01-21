import { connectToApps, loginToSenderAccount } from '../utils/helper';
import { test, expect } from '../utils/loader';

test.beforeEach(async ({ page, extensionId }) => {
  // Login to our sender account
  await loginToSenderAccount({ page, extensionId });
  await connectToApps({
    page,
    extensionId,
    url: 'https://flow-evm-dapp.vercel.app/',
    testId: 'rk-connect-button',
    idx: 0,
  });

  const flowBtn = await page.getByTestId('rk-wallet-option-com.flowfoundation.wallet');
  expect(flowBtn).toBeVisible();
  await flowBtn.click();

  await new Promise((resolve) => setTimeout(resolve, 5000));
});

test('Verify connect with wallet', async ({ page, extensionId }) => {
  test.slow();
  const nickname = process.env.TEST_SENDER_NICKNAME || 'Sender';
  const address = process.env.TEST_SENDER_ADDR || 'Unknown Address';
  const coaAddress = process.env.TEST_SENDER_EVM_ADDR || 'Unknown EVM Address';
  const eoaAddress = process.env.TEST_SENDER_EOA_ADDR || 'Unknown EVM Address';
  console.log(`Starting balance check for Sender: ${nickname} (${address})`);

  // Login to sender account

  // page.on('popup', async (popupPage) => {

  //   console.log(popupPage);
  //   const changeAccBtn = await popupPage.getByTestId('account-card-chevron');
  //   expect(changeAccBtn).toBeVisible();

  //   changeAccBtn.click();
  // });

  // await captureExtensionPage();

  // await page.getByText('Flow Wallet').click();

  // await page.getByTestId('connect-button').click();

  // await new Promise((resolve) => setTimeout(resolve, 7000));

  const flowEoaAddr = await page.getByText(eoaAddress);

  expect(flowEoaAddr).toBeVisible();

  // // Assert based on the overall result
  // expect(
  //   overallSufficient,
  //   `One or more token balances are insufficient for ${nickname} (${address}). See attached report.`
  // ).toBeTruthy();
});

test('Verify connect with EIP6963 (EVM)', async ({ page, extensionId }) => {
  test.slow();
  const eoaAddress = process.env.TEST_SENDER_EOA_ADDR || 'Unknown EVM Address';

  const EIP6963Btn = await page.getByTestId('connect-button-Flow-Wallet');
  expect(EIP6963Btn).toBeVisible();
  await EIP6963Btn.click();

  const evmEoaAddr = await page.getByText(eoaAddress).nth(1);

  expect(evmEoaAddr).toBeVisible();
});
