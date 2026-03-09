import { connectToApps, loginToSenderAccount } from '../utils/helper';
import { test, expect, wait } from '../utils/loader';

test.beforeEach(async ({ page, extensionId }) => {
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

  await wait(3000);
});

test('Verify connect with wallet', async ({ page, extensionId }) => {
  test.slow();
  const nickname = process.env.TEST_SENDER_NICKNAME || 'Sender';
  const address = process.env.TEST_SENDER_ADDR || 'Unknown Address';
  const coaAddress = process.env.TEST_SENDER_EVM_ADDR || 'Unknown EVM Address';
  const eoaAddress = process.env.TEST_SENDER_EOA_ADDR || 'Unknown EVM Address';
  console.log(`Starting balance check for Sender: ${nickname} (${address})`);
  await wait(5000);
  const flowEoaAddr = await page.getByText(eoaAddress);

  expect(flowEoaAddr).toBeVisible();
});

test('Verify connect with EIP6963 (EVM)', async ({ page, extensionId }) => {
  test.slow();
  const eoaAddress = process.env.TEST_SENDER_EOA_ADDR || 'Unknown EVM Address';

  const EIP6963Btn = await page.getByTestId('connect-button-Flow-Wallet');
  expect(EIP6963Btn).toBeVisible();
  await EIP6963Btn.click();
  await wait(5000);

  const evmEoaAddr = await page.getByText(eoaAddress).nth(1);

  expect(evmEoaAddr).toBeVisible();
});

test('Request account', async ({ page, extensionId }) => {
  test.slow();
  const eoaAddress = process.env.TEST_SENDER_EOA_ADDR || 'Unknown EVM Address';
  await wait(6000);
  await page.goto('https://flow-evm-dapp.vercel.app/methods/eth_requestAccounts');
  await wait(2000);
  const exeBtn = await page.getByRole('button', { name: 'Execute' });
  await exeBtn.click();
  await wait(5000);

  const res = await page.getByText(eoaAddress);
  expect(res).toBeVisible();
});

test('Request permissions', async ({ page, extensionId }) => {
  test.slow();
  const eoaAddress = process.env.TEST_SENDER_EOA_ADDR || 'Unknown EVM Address';
  await wait(5000);
  await page.goto('https://flow-evm-dapp.vercel.app/methods/wallet_requestPermissions');
  await wait(2000);
  const exeBtn = await page.getByRole('button', { name: 'Execute' });
  await exeBtn.click();
  await wait(5000);

  const res = await page.getByText('parentCapability');
  expect(res).toBeVisible();
});

test('Sign message', async ({ page, extensionId }) => {
  test.slow();
  await wait(5000);
  await page.goto('https://flow-evm-dapp.vercel.app/methods/personal_sign');
  await wait(2000);
  const exeBtn = await page.getByRole('button', { name: 'Execute' });
  await exeBtn.click();
  await wait(8000);

  const res = await page.getByText('verificationResult');
  expect(res).toBeVisible();
});
