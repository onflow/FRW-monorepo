// Export types
export type { SendPayload, TransferStrategy } from './types';

// Export validation functions
export * from './validation';

// Export utility functions
export { encodeEvmContractCallData } from './utils';

// Export context and main function
export { createTransferContext, TransferContext } from './context';

// Export individual strategies for testing or advanced usage
export * from './nftStrategies';
export * from './tokenStrategies';

// Main entry point - use global logger from utils
import { logger } from '@onflow/frw-utils';

import { createTransferContext } from './context';
import type { SendPayload, TransferExecutionHelpers } from './types';

/**
 * Main entry point for sending transactions using Strategy Pattern
 * Routes to appropriate transfer strategy based on payload characteristics
 * @param payload - Complete send transaction payload
 * @param cadenceService - CadenceService instance for executing transactions
 * @returns Transaction result
 */
export const SendTransaction = async (
  payload: SendPayload,
  cadenceService: any,
  helpers: TransferExecutionHelpers = {}
) => {
  logger.debug('SendTransaction payload', payload);
  const context = createTransferContext(cadenceService, helpers);
  return await context.execute(payload);
};
