// Export types
export type { SendPayload, TransferStrategy } from './types';

// Export validation functions
export { isValidSendTransactionPayload } from './validation';

// Export utility functions
export { encodeEvmContractCallData } from './utils';

// Export context and main function
export { createTransferContext, TransferContext } from './context';

// Export individual strategies for testing or advanced usage
export * from './nftStrategies';
export * from './tokenStrategies';

// Main entry point
import { createTransferContext } from './context';
import type { SendPayload } from './types';

/**
 * Main entry point for sending transactions using Strategy Pattern
 * Routes to appropriate transfer strategy based on payload characteristics
 * @param payload - Complete send transaction payload
 * @returns Transaction result
 */
export const SendTransaction = async (payload: SendPayload) => {
  const context = createTransferContext();
  return await context.execute(payload);
};
