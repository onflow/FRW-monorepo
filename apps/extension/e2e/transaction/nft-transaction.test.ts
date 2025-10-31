import { expect } from '@playwright/test';

import {
  getCurrentAddress,
  waitForTransaction,
  loginToSenderOrReceiver,
  getReceiverEvmAccount,
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
const senderChildAddr2 = process.env.TEST_SENDER_CHILD_ADDR2!;

export const sendNFT = async ({ page, collectionName, receiver, successtext }) => {
  // Wait for the EVM account to be loaded
  await getCurrentAddress(page);
  // send Ft token from COA
  const sendButton = page.getByTestId(`send-button`);
  await expect(sendButton).toBeVisible({ timeout: 30_000 });
  await sendButton.click();

  const nftTab = page.getByTestId(`NFTs`);
  await expect(nftTab).toBeVisible({ timeout: 60_000 });
  await nftTab.click();

  const collectionTile = page.getByTestId(collectionName);
  await expect(collectionTile, `Collection tile ${collectionName} should be visible`).toBeVisible({
    timeout: 60_000,
  });
  await collectionTile.click();

  const firstNftTile = page.getByTestId('0');
  await expect(firstNftTile, 'NFT tile index 0 should be visible').toBeVisible({ timeout: 60_000 });
  await firstNftTile.click();

  const confirmSelectionButton = page.getByTestId('confirm');
  await expect(confirmSelectionButton).toBeEnabled({ timeout: 60_000 });
  await confirmSelectionButton.click();

  const addressInput = page.getByPlaceholder('Search / Paste address');
  await expect(addressInput).toBeVisible({ timeout: 60_000 });
  await addressInput.click();
  await addressInput.fill(receiver);

  const nextButton = page.getByTestId('next');
  await expect(nextButton).toBeEnabled({ timeout: 60_000 });
  await nextButton.click();

  const confirmSendButton = page.getByTestId('confirm');
  await expect(confirmSendButton).toBeEnabled({ timeout: 60_000 });
  await confirmSendButton.click();

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
  const sendButton = page.getByTestId(`send-button`);
  await expect(sendButton).toBeVisible({ timeout: 30_000 });
  await sendButton.click();

  const nftTab = page.getByTestId(`NFTs`);
  await expect(nftTab).toBeVisible({ timeout: 60_000 });
  await nftTab.click();

  const collectionTile = page.getByTestId(collectionName);
  await expect(collectionTile, `Collection tile ${collectionName} should be visible`).toBeVisible({
    timeout: 60_000,
  });
  await collectionTile.click();

  for (let i = 0; i < idx.length; i++) {
    const nftTile = page.getByTestId(idx[i]);
    await expect(nftTile, `NFT tile index ${idx[i]} should be visible`).toBeVisible({
      timeout: 60_000,
    });
    await nftTile.click();
  }
  const confirmSelectionButton = page.getByTestId('confirm');
  await expect(confirmSelectionButton).toBeEnabled({ timeout: 60_000 });
  await confirmSelectionButton.click();

  const addressInput = page.getByPlaceholder('Search / Paste address');
  await expect(addressInput).toBeVisible({ timeout: 60_000 });
  await addressInput.click();
  await addressInput.fill(receiver);

  const nextButton = page.getByTestId('next');
  await expect(nextButton).toBeEnabled({ timeout: 60_000 });
  await nextButton.click();

  const confirmSendButton = page.getByTestId('confirm');
  await expect(confirmSendButton).toBeEnabled({ timeout: 60_000 });
  await confirmSendButton.click();

  // Wait for the transaction to be completed
  const txId = await waitForTransaction({ page, successtext });
  return { txId, collectionName };
};

test.beforeEach(async ({ page, extensionId }) => {
  // Login to our sender account
  await loginToSenderOrReceiver({ page, extensionId, parallelIndex: test.info().parallelIndex });
  // await switchToMainAccount({
  //   page,
  //   address: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
  // });
});

test('NFT to flow', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];
  await loginToSenderAccount({
    page,
    extensionId,
  });

  await switchToMainAccount({
    page,
    address: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
  });
  //Send Fts from COA to COA
  // Send FLOW token from COA to COA
  const tx1 = await sendNFT({
    page,
    collectionName: 'FLOAT',
    receiver: process.env.TEST_RECEIVER_ADDR!,
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

test('NFT to Coa', async ({ page, extensionId }) => {
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

test('NFT Coa to Coa', async ({ page, extensionId }) => {
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

test('NFT to Flow', async ({ page, extensionId }) => {
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

test('multi NFT to Flow', async ({ page, extensionId }) => {
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

test('NFT 1155 transactions to evm', async ({ page, extensionId }) => {
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

test('NFT to child', async ({ page, extensionId }) => {
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

  // const tx2 = await sendNFTs({
  //   page,
  //   collectionName: 'FLOAT',
  //   receiver: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
  //   successtext: /success|Finalized|Executed|Sealed/,
  //   idx: ['1'],
  // });

  // txList.push(tx2);

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

test('NFT from evm to child', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  //Send NFT to sender COA
  await switchToEvmAddress({
    page,
    address: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
  });

  const tx1 = await sendNFTs({
    page,
    collectionName: 'FLOAT',
    receiver: senderChildAddr,
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

// test child sender
test('NFT from child to evm', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  //Send NFT to sender COA
  await switchToChildAccount({
    page,
    address: senderChildAddr,
  });

  const tx1 = await sendNFTs({
    page,
    collectionName: 'FLOAT',
    receiver: getSenderEvmAccount({ parallelIndex: test.info().parallelIndex }),
    successtext: /success|Finalized|Executed|Sealed/,
    idx: ['0'],
  });

  txList.push(tx1);

  const tx2 = await sendNFTs({
    page,
    collectionName: 'FLOAT',
    receiver: getSenderCadenceAccount({ parallelIndex: test.info().parallelIndex }),
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

// test child sender to child
test('NFT from child to child', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  //Send NFT to sender COA
  await switchToChildAccount({
    page,
    address: senderChildAddr,
  });

  const tx1 = await sendNFT({
    page,
    collectionName: 'NBA Top Shot',
    receiver: senderChildAddr2,
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
        collectionName: 'NBA Top Shot',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});

// test child sender back to main
test('NFT from child to child back', async ({ page, extensionId }) => {
  test.setTimeout(120_000);
  const txList: { txId: string; collectionName: string }[] = [];

  //Send NFT to sender COA
  await switchToChildAccount({
    page,
    address: senderChildAddr2,
  });

  const tx1 = await sendNFT({
    page,
    collectionName: 'NBA Top Shot',
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
        collectionName: 'NBA Top Shot',
        sealedText: 'Sealed',
        isEvm: true,
      });
    })
  );
});
