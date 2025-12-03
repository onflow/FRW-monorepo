/**
 * Example usage of the new transaction events system
 *
 * This example demonstrates how to use the analytics package with:
 * - Flow blockchain transaction tracking
 * - Required proposer and payer addresses
 * - Cadence script hashes and authorizations
 * - CamelCase naming conventions
 */
import { createConsoleAnalytics, TransactionTracker } from '../index.js';

async function demonstrateTransactionTracking() {
  // Create analytics instance
  const analytics = await createConsoleAnalytics({ debug: true });

  // Create transaction tracker
  const transactionTracker = new TransactionTracker(analytics);

  // Example 1: Direct transaction flow
  console.log('=== Example 1: Direct Transaction ===');

  // Create transaction session with required Flow blockchain parameters:
  // - strategy: transaction strategy name
  // - proposer: Flow account that proposes the transaction
  // - payer: Flow account that pays for the transaction
  // - cadenceHash: hash of the Cadence script (optional)
  // - authorizations: list of authorized accounts (optional)
  // - assetType: type of asset being transferred (optional)
  const directSession = transactionTracker.createTransactionSession(
    'direct_transfer',
    '0x123proposer...',
    '0x456payer...',
    'cadence_hash_123',
    ['0x123proposer...'],
    'FLOW'
  );

  await directSession.initiated({
    assetType: 'FLOW',
    networkType: 'flow',
    strategyType: 'direct',
    amount: '10.5',
    isCrossVm: false,
  });

  await directSession.strategySelected({
    strategyName: 'direct_transfer',
    assetType: 'FLOW',
    networkType: 'flow',
    executionPath: 'flow_native',
  });

  await directSession.prepared(1200, '0.001');
  await directSession.signed('wallet');
  await directSession.submitted('0x123abc...');
  await directSession.completed(true, '0.0008');

  // Example 2: Cross-VM transfer flow
  console.log('\n=== Example 2: Cross-VM Transfer ===');

  const crossVmSession = transactionTracker.createTransactionSession(
    'cross_vm_bridge',
    '0x789proposer...',
    '0xabcpayer...',
    'cadence_hash_456',
    ['0x789proposer...', '0xdefauthorizer...'],
    'USDC'
  );
  const crossVm = transactionTracker.createCrossVmSession('flow', 'evm');

  await crossVmSession.initiated({
    assetType: 'USDC',
    networkType: 'crossVm',
    strategyType: 'crossVm',
    amount: '100.0',
    isCrossVm: true,
  });

  await crossVm.trackTransfer('USDC', 'flow_evm_bridge');

  await crossVmSession.prepared(2500, '0.015');
  await crossVmSession.signed('wallet');
  await crossVmSession.submitted('0x456def...');
  await crossVmSession.completed(true, '0.012');

  // Example 3: Bridge operation
  console.log('\n=== Example 3: Bridge Operation ===');

  const bridgeSession = transactionTracker.createBridgeSession(
    'flow_evm_bridge',
    'Flow',
    'Ethereum'
  );

  await bridgeSession.trackOperation('USDC', {
    bridgeFee: '0.5',
    estimatedTimeMinutes: 15,
  });

  // Example 4: Child account transaction
  console.log('\n=== Example 4: Child Account Transaction ===');

  await transactionTracker.trackChildAccountTransaction({
    operationType: 'create',
    childCount: 3,
    parentAddress: '0x789ghi...',
  });

  // Example 5: Validation error
  console.log('\n=== Example 5: Validation Error ===');

  await transactionTracker.trackValidationError({
    validationType: 'balance',
    fieldName: 'amount',
    errorMessage: 'Insufficient balance for transaction',
  });

  // Example 6: Transaction error
  console.log('\n=== Example 6: Transaction Error ===');

  const failedSession = transactionTracker.createTransactionSession(
    'direct_transfer',
    '0xfailedproposer...',
    '0xfailedpayer...',
    'cadence_hash_failed',
    ['0xfailedproposer...'],
    'FLOW'
  );

  await failedSession.initiated({
    assetType: 'FLOW',
    networkType: 'flow',
    strategyType: 'direct',
    amount: '5.0',
  });

  await failedSession.failed('network', 'NETWORK_ERROR', 'submission');

  console.log('\n=== Transaction Tracking Examples Complete ===');
}

// Export for potential usage
export { demonstrateTransactionTracking };
