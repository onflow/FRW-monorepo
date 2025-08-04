import {
  ChildToChildNftStrategy,
  ChildToOthersNftStrategy,
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
 * @returns Configured TransferContext instance
 */
export const createTransferContext = (): TransferContext => {
  const context = new TransferContext();

  // Add token transfer strategies
  context.addStrategy(new ChildToChildTokenStrategy());
  context.addStrategy(new ChildToOthersTokenStrategy());
  context.addStrategy(new ParentToChildTokenStrategy());
  context.addStrategy(new FlowToFlowTokenStrategy());
  context.addStrategy(new FlowToEvmTokenStrategy());
  context.addStrategy(new FlowTokenBridgeToEvmStrategy());
  context.addStrategy(new EvmToFlowCoaWithdrawalStrategy());
  context.addStrategy(new EvmToFlowTokenBridgeStrategy());
  context.addStrategy(new EvmToEvmTokenStrategy());

  // Add NFT transfer strategies
  context.addStrategy(new ChildToChildNftStrategy());
  context.addStrategy(new ChildToOthersNftStrategy());
  context.addStrategy(new ParentToChildNftStrategy());
  context.addStrategy(new TopShotNftStrategy());
  context.addStrategy(new FlowToFlowNftStrategy());
  context.addStrategy(new FlowToEvmNftBridgeStrategy());
  context.addStrategy(new EvmToFlowNftBridgeStrategy());
  context.addStrategy(new EvmToEvmNftStrategy());

  return context;
};
