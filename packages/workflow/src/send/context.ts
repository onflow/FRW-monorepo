import {
  ChildToOthersNftStrategy,
  ChildToChildNftStrategy,
  EvmToEvmNftStrategy,
  EvmToFlowNftBridgeStrategy,
  FlowToEvmNftBridgeStrategy,
  FlowToFlowNftStrategy,
  ParentToChildNftStrategy,
  TopShotNftStrategy,
} from './nftStrategies';
import {
  ChildToChildTokenStrategy,
  ChildToOthersTokenStrategy,
  EvmToEvmTokenStrategy,
  EvmToFlowCoaWithdrawalStrategy,
  EvmToFlowTokenBridgeStrategy,
  FlowToEvmTokenStrategy,
  FlowToFlowTokenStrategy,
  FlowTokenBridgeToEvmStrategy,
  ParentToChildTokenStrategy,
} from './tokenStrategies';
import type { SendPayload, TransferStrategy } from './types';

/**
 * Context class that uses the Strategy Pattern to execute transfers
 */
export class TransferContext {
  private strategies: TransferStrategy[];

  constructor() {
    this.strategies = [];
  }

  /**
   * Add a strategy to the context
   * @param strategy - Transfer strategy to add
   */
  addStrategy(strategy: TransferStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Execute the appropriate strategy for the given payload
   * @param payload - SendPayload to process
   * @returns Transaction result or null if no strategy can handle the payload
   */
  async execute(payload: SendPayload): Promise<any> {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(payload)) {
        return await strategy.execute(payload);
      }
    }
    return null;
  }
}

/**
 * Creates and configures a TransferContext with all available strategies
 * @param cadenceService - CadenceService instance for executing transactions
 * @returns Configured TransferContext instance
 */
export const createTransferContext = (cadenceService: any): TransferContext => {
  const context = new TransferContext();

  // Add token transfer strategies
  context.addStrategy(new ChildToChildTokenStrategy(cadenceService));
  context.addStrategy(new ChildToOthersTokenStrategy(cadenceService));
  context.addStrategy(new ParentToChildTokenStrategy(cadenceService));
  context.addStrategy(new FlowToFlowTokenStrategy(cadenceService));
  context.addStrategy(new FlowToEvmTokenStrategy(cadenceService));
  context.addStrategy(new FlowTokenBridgeToEvmStrategy(cadenceService));
  context.addStrategy(new EvmToFlowCoaWithdrawalStrategy(cadenceService));
  context.addStrategy(new EvmToFlowTokenBridgeStrategy(cadenceService));
  context.addStrategy(new EvmToEvmTokenStrategy(cadenceService));

  // Add NFT transfer strategies
  context.addStrategy(new ChildToChildNftStrategy(cadenceService));
  context.addStrategy(new ChildToOthersNftStrategy(cadenceService));
  context.addStrategy(new ParentToChildNftStrategy(cadenceService));
  context.addStrategy(new TopShotNftStrategy(cadenceService));
  context.addStrategy(new FlowToFlowNftStrategy(cadenceService));
  context.addStrategy(new FlowToEvmNftBridgeStrategy(cadenceService));
  context.addStrategy(new EvmToFlowNftBridgeStrategy(cadenceService));
  context.addStrategy(new EvmToEvmNftStrategy(cadenceService));

  return context;
};
