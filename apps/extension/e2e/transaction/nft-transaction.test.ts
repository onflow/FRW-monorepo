import {
  getCurrentAddress,
  waitForTransaction,
  loginToSenderOrReceiver,
  getReceiverEvmAccount,
  getReceiverCadenceAccount,
  getSenderCadenceAccount,
  switchToEvmAddress,
  getSenderEvmAccount,
  loginToReceiverAccount,
  loginToSenderAccount,
  checkNFTTrx,
  switchToMainAccount,
  switchToChildAccount,
} from '../utils/helper';
import { test } from '../utils/loader';

const senderChildAddr = process.env.TEST_SENDER_CHILD_ADDR!;

export const sendNFT = async ({ page, collectionName, receiver, successtext }) => {
  // Wait for the EVM account to be loaded
  await getCurrentAddress(page);
  // send Ft token from COA
  await page.getByTestId(`send-button`).click();

  await page.getByTestId(`NFTs`).isVisible();
  await page.getByTestId(`NFTs`).click();
  await page.getByTestId(collectionName).isVisible();
  await page.getByTestId(collectionName).click();
  await page.getByTestId('0').isVisible();
  await page.getByTestId('0').click();

  await page.getByTestId('confirm').click();
  await page.getByPlaceholder('Search/ Paste address').click();
  await page.getByPlaceholder('Search/ Paste address').fill(receiver);

  await page.getByTestId('next').isVisible();
  await page.getByTestId('next').click();
  await page.getByTestId('confirm').click();

  // Wait for the transaction to be completed
  const txId = await waitForTransaction({ page, successtext });
  return { txId, collectionName };
};

export const sendNFTs = async ({
  page,
  collectionName,
  receiver,
  successtext,
  idx = ['0', '1'],
}) => {
  // Wait for the EVM account to be loaded
  await getCurrentAddress(page);
  // send Ft token from COA
  await page.getByTestId(`send-button`).click();

  await page.getByTestId(`NFTs`).isVisible();
  await page.getByTestId(`NFTs`).click();
  await page.getByTestId(collectionName).click();
  for (let i = 0; i < idx.length; i++) {
    await page.getByTestId(idx[i]).isVisible();
    await page.getByTestId(idx[i]).click();
  }
  await page.getByTestId('confirm').click();
  await page.getByPlaceholder('Search/ Paste address').click();
  await page.getByPlaceholder('Search/ Paste address').fill(receiver);

  await page.getByTestId('next').isVisible();
  await page.getByTestId('next').click();
  await page.getByTestId('confirm').click();

  // Wait for the transaction to be completed
  const txId = await waitForTransaction({ page, successtext });
  return { txId, collectionName };
};

test.beforeEach(async ({ page, extensionId }) => {
  // Login to our sender account
  await loginToSenderOrReceiver({ page, extensionId, parallelIndex: test.info().parallelIndex });
  await switchToMainAccount({
    page,
    address: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
  });
});

test('NFT transactions', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  //Send Fts from COA to COA
  // Send FLOW token from COA to COA
  const tx1 = await sendNFT({
    page,
    collectionName: 'FLOAT',
    receiver: getReceiverCadenceAccount({ parallelIndex: test.info().parallelIndex }),
    successtext: /success|Finalized|Executed|Sealed/,
  });

  txList.push(tx1);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
      });
    })
  );
});

test('NFT transactions to Coa', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  await loginToReceiverAccount({
    page,
    extensionId,
  });

  //Send NFT to COA
  const tx1 = await sendNFT({
    page,
    collectionName: 'FLOAT',
    receiver: getReceiverEvmAccount({ parallelIndex: test.info().parallelIndex }),
    successtext: /success|Finalized|Executed|Sealed/,
  });

  txList.push(tx1);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
      });
    })
  );
});

test('NFT transactions Coa to Coa', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  await loginToReceiverAccount({
    page,
    extensionId,
  });

  //Send NFT to sender COA
  await switchToEvmAddress({
    page,
    address: getReceiverEvmAccount({ parallelIndex: test.info().parallelIndex }),
  });

  const tx1 = await sendNFT({
    page,
    collectionName: 'FLOAT',
    receiver: process.env.TEST_SENDER_EVM_ADDR!,
    successtext: /success|Finalized|Executed|Sealed/,
  });

  txList.push(tx1);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});

test('NFT transactions to Flow', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  await loginToSenderAccount({
    page,
    extensionId,
  });

  //Send NFT to sender COA
  await switchToEvmAddress({
    page,
    address: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
  });

  const tx1 = await sendNFT({
    page,
    collectionName: 'FLOAT',
    receiver: process.env.TEST_SENDER_ADDR!,
    successtext: /success|Finalized|Executed|Sealed/,
  });

  txList.push(tx1);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});

test('multi NFT transactions to Flow', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  await loginToSenderAccount({
    page,
    extensionId,
  });

  //Send NFT to sender COA
  await switchToMainAccount({
    page,
    address: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
  });

  const tx1 = await sendNFTs({
    page,
    collectionName: 'FLOAT',
    receiver: process.env.TEST_SENDER_ADDR!,
    successtext: /success|Finalized|Executed|Sealed/,
    idx: ['0', '1'],
  });

  txList.push(tx1);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});

test('NFT 1155 transactions to Flow', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  await loginToSenderAccount({
    page,
    extensionId,
  });

  await switchToEvmAddress({
    page,
    address: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
  });

  const tx1 = await sendNFTs({
    page,
    collectionName: 'ERC1155 test collection',
    receiver: process.env.TEST_SENDER_EVM_ADDR!,
    successtext: /success|Finalized|Executed|Sealed/,
    idx: ['0'],
  });

  txList.push(tx1);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});

// child account nft test

test('NFT transactions to child', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  await loginToSenderAccount({
    page,
    extensionId,
  });

  //Send NFT to sender COA
  await switchToMainAccount({
    page,
    address: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
  });

  const tx1 = await sendNFT({
    page,
    collectionName: 'FLOAT',
    receiver: senderChildAddr,
    successtext: /success|Finalized|Executed|Sealed/,
  });

  txList.push(tx1);

  const tx2 = await sendNFTs({
    page,
    collectionName: 'FLOAT',
    receiver: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
    successtext: /success|Finalized|Executed|Sealed/,
    idx: ['1'],
  });

  txList.push(tx2);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});

test('NFT transactions from evm to child', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  await loginToSenderAccount({
    page,
    extensionId,
  });

  //Send NFT to sender COA
  await switchToEvmAddress({
    page,
    address: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
  });

  const tx1 = await sendNFT({
    page,
    collectionName: 'FLOAT',
    receiver: senderChildAddr,
    successtext: /success|Finalized|Executed|Sealed/,
  });

  txList.push(tx1);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});

// test child sender
test('NFT transactions from child to others', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  await loginToSenderAccount({
    page,
    extensionId,
  });

  //Send NFT to sender COA
  await switchToChildAccount({
    page,
    address: senderChildAddr,
  });

  const tx1 = await sendNFT({
    page,
    collectionName: 'FLOAT',
    receiver: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
    successtext: /success|Finalized|Executed|Sealed/,
  });

  txList.push(tx1);

  const tx2 = await sendNFTs({
    page,
    collectionName: 'FLOAT',
    receiver: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
    successtext: /success|Finalized|Executed|Sealed/,
    idx: ['1'],
  });

  txList.push(tx2);

  // Go to the activity page
  await page.goto(`chrome-extension://${extensionId}/index.html#/dashboard?activity=1`);
  await page.waitForURL(/.*\/dashboard.*/);
  // Check the amounts that were sent for each transaction
  await Promise.all(
    txList.map(async (tx) => {
      await checkNFTTrx({
        page,
        txId: tx.txId,
        collectionName: 'FLOAT',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});
