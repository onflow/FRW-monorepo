import {
  getCurrentAddress,
  waitForTransaction,
  loginToSenderOrReceiver,
  getReceiverEvmAccount,
  getReceiverCadenceAccount,
  getSenderCadenceAccount,
  switchToEvmAddress,
  getSenderEvmAccount,
  switchToMainAccount,
  checkSentAmount,
} from '../utils/helper';
import { test } from '../utils/loader';

export const sendFT = async ({ page, tokenName, receiver, amount, ingoreFlowCharge = false }) => {
  // Wait for the EVM account to be loaded
  await getCurrentAddress(page);
  // send Ft token from COA
  await page.getByTestId(`send-button`).click();

  await page.getByTestId(`Tokens`).isVisible();
  await page.getByTestId(`Tokens`).click();
  await page.getByTestId(tokenName).click();

  await page.getByPlaceholder('Search address').click();
  await page.getByPlaceholder('Search address').fill(receiver);
  await page.getByPlaceholder('0.00').fill(amount);
  await page.getByTestId('next').click();
  await page.getByTestId('confirm').click();
  // Wait for the transaction to be completed
  const txId = await waitForTransaction({ page, successtext: /Executed|Sealed/, ingoreFlowCharge });
  return { txId, tokenName, amount, ingoreFlowCharge };
};

test.beforeEach(async ({ page, extensionId }) => {
  // Login to our sender account
  await loginToSenderOrReceiver({ page, extensionId, parallelIndex: test.info().parallelIndex });
  await switchToMainAccount({
    page,
    address: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
  });
});

//Send FLOW token from Flow to Flow
test('send FTs ', async ({ page, extensionId }) => {
  const txList: { txId: string; tokenName: string; amount: string; ingoreFlowCharge: boolean }[] =
    [];

  test.setTimeout(120_000);
  test.setTimeout(120_000);
  // send USDC.e to flow
  const tx1 = await sendFT({
    page,
    tokenName: 'USDC.e',
    receiver: getReceiverCadenceAccount({ parallelIndex: test.info().parallelIndex }),
    amount: '0.000001',
  });
  txList.push(tx1);

  //Send USDC.e from Flow to Coa
  const tx2 = await sendFT({
    page,
    tokenName: 'USDC.e',
    receiver: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
    amount: '0.000001',
  });
  txList.push(tx2);

  //Send FLOW token from Flow to COA
  // This can take a while

  //Check all sealed transactions
  // Check the amounts that were sent for each transaction
  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);

  await Promise.all(
    txList.map(async (tx) => {
      await checkSentAmount({
        page,
        txId: tx.txId,
        amount: tx.amount,
        sealedText: 'sealed',
        ingoreFlowCharge: tx.ingoreFlowCharge,
      });
    })
  );
});

test('send FTs with Coa ', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; tokenName: string; amount: string; ingoreFlowCharge: boolean }[] =
    [];
  await switchToEvmAddress({
    page,
    address: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
  });

  const tx1 = await sendFT({
    page,
    tokenName: 'USDC.e',
    receiver: getReceiverEvmAccount({ parallelIndex: test.info().parallelIndex }),
    amount: '0.000001',
  });
  txList.push(tx1);

  const tx2 = await sendFT({
    page,
    tokenName: 'USDC.e',
    receiver: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
    amount: '0.000001',
  });
  txList.push(tx2);

  await Promise.all(
    txList.map(async (tx) => {
      await checkSentAmount({
        page,
        txId: tx.txId,
        amount: tx.amount,
        sealedText: 'sealed',
        ingoreFlowCharge: tx.ingoreFlowCharge,
        isEvm: true,
      });
    })
  );
});
