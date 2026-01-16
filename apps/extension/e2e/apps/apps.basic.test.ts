import { connectToApps } from '../utils/helper';
import { test, expect } from '../utils/loader';

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
  });

  // Assert based on the overall result
  expect(
    overallSufficient,
    `One or more token balances are insufficient for ${nickname} (${address}). See attached report.`
  ).toBeTruthy();

  console.log(`Sender (${nickname}) balance verification complete.`);
});
