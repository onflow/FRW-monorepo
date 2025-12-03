import type { Analytics } from '../analytics.js';
import type { TransactionEvents } from '../types.js';

export class TransactionTracker {
  constructor(private analytics: Analytics) {}

  // Core Transaction Events
  async trackTransactionInitiated(
    params: TransactionEvents['transactionInitiated']
  ): Promise<void> {
    await this.analytics.track('transactionInitiated', params);
  }

  async trackStrategySelected(params: TransactionEvents['strategySelected']): Promise<void> {
    await this.analytics.track('strategySelected', params);
  }

  async trackTransactionPrepared(params: TransactionEvents['transactionPrepared']): Promise<void> {
    await this.analytics.track('transactionPrepared', params);
  }

  async trackTransactionSigned(params: TransactionEvents['transactionSigned']): Promise<void> {
    await this.analytics.track('transactionSigned', params);
  }

  async trackTransactionSubmitted(
    params: TransactionEvents['transactionSubmitted']
  ): Promise<void> {
    await this.analytics.track('transactionSubmitted', params);
  }

  async trackTransactionCompleted(
    params: TransactionEvents['transactionCompleted']
  ): Promise<void> {
    await this.analytics.track('transactionCompleted', params);
  }

  // Strategy-Specific Events
  async trackBridgeOperation(params: TransactionEvents['bridgeOperation']): Promise<void> {
    await this.analytics.track('bridgeOperation', params);
  }

  async trackChildAccountTransaction(
    params: TransactionEvents['childAccountTransaction']
  ): Promise<void> {
    await this.analytics.track('childAccountTransaction', params);
  }

  async trackCrossVmTransfer(params: TransactionEvents['crossVmTransfer']): Promise<void> {
    await this.analytics.track('crossVmTransfer', params);
  }

  // Error and Performance Events
  async trackTransactionError(params: TransactionEvents['transactionError']): Promise<void> {
    await this.analytics.track('transactionError', params);
  }

  async trackStrategyPerformance(params: TransactionEvents['strategyPerformance']): Promise<void> {
    await this.analytics.track('strategyPerformance', params);
  }

  async trackValidationError(params: TransactionEvents['validationError']): Promise<void> {
    await this.analytics.track('validationError', params);
  }

  // Factory methods for transaction sessions
  createTransactionSession(
    strategy: string,
    proposer: string,
    payer: string,
    cadenceHash?: string,
    authorizations?: string[],
    assetType?: string
  ) {
    return new TransactionSession(
      this.analytics,
      strategy,
      proposer,
      payer,
      cadenceHash,
      authorizations,
      assetType
    );
  }

  createBridgeSession(bridgeType: string, fromNetwork: string, toNetwork: string) {
    return new BridgeSession(this.analytics, bridgeType, fromNetwork, toNetwork);
  }

  createCrossVmSession(fromVm: 'flow' | 'evm', toVm: 'flow' | 'evm') {
    return new CrossVmSession(this.analytics, fromVm, toVm);
  }
}

export class TransactionSession {
  private startTime = Date.now();
  private sessionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  private steps: Array<{
    step: string;
    timestamp: number;
    duration?: number;
    success?: boolean;
  }> = [];

  constructor(
    private analytics: Analytics,
    private strategy: string,
    private proposer: string,
    private payer: string,
    private cadenceHash?: string,
    private authorizations?: string[],
    private assetType?: string
  ) {}

  private getBaseProperties() {
    const base: any = {
      strategyName: this.strategy,
      sessionId: this.sessionId,
      sessionStartTime: this.startTime,
      proposer: this.proposer,
      payer: this.payer,
    };

    if (this.assetType) base.assetType = this.assetType;
    if (this.cadenceHash) base.cadenceHash = this.cadenceHash;
    if (this.authorizations && this.authorizations.length > 0) {
      base.authorizations = this.authorizations;
    }

    return base;
  }

  async initiated(params?: Partial<TransactionEvents['transactionInitiated']>): Promise<void> {
    const stepStartTime = Date.now();

    await this.analytics.track('transactionInitiated', {
      ...this.getBaseProperties(),
      ...params,
    });

    this.steps.push({
      step: 'initiated',
      timestamp: stepStartTime,
    });
  }

  async strategySelected(params?: Partial<TransactionEvents['strategySelected']>): Promise<void> {
    const stepStartTime = Date.now();

    await this.analytics.track('strategySelected', {
      ...this.getBaseProperties(),
      ...params,
    });

    this.steps.push({
      step: 'strategySelected',
      timestamp: stepStartTime,
    });
  }

  async prepared(preparationTimeMs?: number, gasEstimate?: string): Promise<void> {
    const stepStartTime = Date.now();
    const actualPreparationTime = preparationTimeMs || stepStartTime - this.getLastStepTime();

    await this.analytics.track('transactionPrepared', {
      ...this.getBaseProperties(),
      preparationTimeMs: actualPreparationTime,
      gasEstimate: gasEstimate,
    });

    this.steps.push({
      step: 'prepared',
      timestamp: stepStartTime,
      duration: actualPreparationTime,
      success: true,
    });
  }

  async signed(
    signatureMethod?: TransactionEvents['transactionSigned']['signatureMethod']
  ): Promise<void> {
    const stepStartTime = Date.now();
    const signingTime = stepStartTime - this.getLastStepTime();

    await this.analytics.track('transactionSigned', {
      ...this.getBaseProperties(),
      signatureMethod: signatureMethod,
      signingTimeMs: signingTime,
    });

    this.steps.push({
      step: 'signed',
      timestamp: stepStartTime,
      duration: signingTime,
      success: true,
    });
  }

  async submitted(transactionHash: string, tix?: string): Promise<void> {
    const stepStartTime = Date.now();
    const submissionTime = stepStartTime - this.getLastStepTime();

    await this.analytics.track('transactionSubmitted', {
      ...this.getBaseProperties(),
      transactionHash: transactionHash,
      submissionTimeMs: submissionTime,
      tix: tix,
    });

    this.steps.push({
      step: 'submitted',
      timestamp: stepStartTime,
      duration: submissionTime,
      success: true,
    });
  }

  async completed(success: boolean, gasUsed?: string, tix?: string): Promise<void> {
    const completionTime = Date.now();
    const totalTime = completionTime - this.startTime;

    await this.analytics.track('transactionCompleted', {
      ...this.getBaseProperties(),
      success,
      totalTimeMs: totalTime,
      gasUsed: gasUsed,
      tix: tix,
    });

    this.steps.push({
      step: 'completed',
      timestamp: completionTime,
      duration: totalTime,
      success,
    });

    // Track performance metrics
    await this.analytics.track('strategyPerformance', {
      ...this.getBaseProperties(),
      executionTimeMs: totalTime,
      gasEfficiency: gasUsed ? parseFloat(gasUsed) : undefined,
    });
  }

  async failed(
    errorType: TransactionEvents['transactionError']['errorType'],
    errorCode?: string,
    stepFailed?: TransactionEvents['transactionError']['stepFailed']
  ): Promise<void> {
    const failureTime = Date.now();

    await this.analytics.track('transactionError', {
      ...this.getBaseProperties(),
      errorType: errorType,
      errorCode: errorCode,
      stepFailed: stepFailed || this.getCurrentStep(),
    });

    this.steps.push({
      step: 'failed',
      timestamp: failureTime,
      success: false,
    });
  }

  async validationError(
    validationType: TransactionEvents['validationError']['validationType'],
    fieldName?: string,
    errorMessage?: string
  ): Promise<void> {
    await this.analytics.track('validationError', {
      ...this.getBaseProperties(),
      validationType: validationType,
      fieldName: fieldName,
      errorMessage: errorMessage,
    });
  }

  private getLastStepTime(): number {
    return this.steps.length > 0 ? this.steps[this.steps.length - 1]!.timestamp : this.startTime;
  }

  private getCurrentStep(): TransactionEvents['transactionError']['stepFailed'] {
    const lastStep = this.steps[this.steps.length - 1];
    if (!lastStep) return 'initiation';

    switch (lastStep.step) {
      case 'initiated':
        return 'initiation';
      case 'prepared':
        return 'preparation';
      case 'signed':
        return 'signing';
      case 'submitted':
        return 'submission';
      default:
        return 'confirmation';
    }
  }

  getDuration(): number {
    return Date.now() - this.startTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getSteps(): Array<{
    step: string;
    timestamp: number;
    duration?: number;
    success?: boolean;
  }> {
    return [...this.steps];
  }
}

export class BridgeSession {
  private sessionId = `bridge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  constructor(
    private analytics: Analytics,
    private bridgeType: string,
    private fromNetwork: string,
    private toNetwork: string
  ) {}

  async trackOperation(
    assetType: string,
    additionalParams?: Partial<TransactionEvents['bridgeOperation']>
  ): Promise<void> {
    await this.analytics.track('bridgeOperation', {
      bridgeType: this.bridgeType,
      fromNetwork: this.fromNetwork,
      toNetwork: this.toNetwork,
      assetType: assetType,
      sessionId: this.sessionId,
      ...additionalParams,
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export class CrossVmSession {
  private sessionId = `crossVm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  constructor(
    private analytics: Analytics,
    private fromVm: 'flow' | 'evm',
    private toVm: 'flow' | 'evm'
  ) {}

  async trackTransfer(
    assetType: string,
    bridgeUsed?: string,
    additionalParams?: Partial<TransactionEvents['crossVmTransfer']>
  ): Promise<void> {
    await this.analytics.track('crossVmTransfer', {
      fromVm: this.fromVm,
      toVm: this.toVm,
      bridgeUsed: bridgeUsed,
      assetType: assetType,
      sessionId: this.sessionId,
      ...additionalParams,
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export class ChildAccountTracker {
  constructor(private analytics: Analytics) {}

  async trackOperation(
    operationType: TransactionEvents['childAccountTransaction']['operationType'],
    childCount?: number,
    parentAddress?: string,
    additionalParams?: Partial<TransactionEvents['childAccountTransaction']>
  ): Promise<void> {
    await this.analytics.track('childAccountTransaction', {
      operationType: operationType,
      childCount: childCount,
      parentAddress: parentAddress,
      ...additionalParams,
    });
  }

  createSession(operationType: TransactionEvents['childAccountTransaction']['operationType']) {
    return new ChildAccountSession(this.analytics, operationType);
  }
}

export class ChildAccountSession {
  private sessionId = `childAccount_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  constructor(
    private analytics: Analytics,
    private operationType: TransactionEvents['childAccountTransaction']['operationType']
  ) {}

  async trackOperation(
    childCount?: number,
    parentAddress?: string,
    additionalParams?: Partial<TransactionEvents['childAccountTransaction']>
  ): Promise<void> {
    await this.analytics.track('childAccountTransaction', {
      operationType: this.operationType,
      childCount: childCount,
      parentAddress: parentAddress,
      sessionId: this.sessionId,
      ...additionalParams,
    });
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export class ValidationTracker {
  constructor(private analytics: Analytics) {}

  async trackError(
    validationType: TransactionEvents['validationError']['validationType'],
    fieldName: string,
    errorMessage: string,
    additionalParams?: Partial<TransactionEvents['validationError']>
  ): Promise<void> {
    await this.analytics.track('validationError', {
      validationType: validationType,
      fieldName: fieldName,
      errorMessage: errorMessage,
      ...additionalParams,
    });
  }

  async trackAmountValidation(errorMessage: string, amount?: string): Promise<void> {
    await this.trackError('amount', 'amount', errorMessage, { amount });
  }

  async trackAddressValidation(errorMessage: string, address?: string): Promise<void> {
    await this.trackError('address', 'recipientAddress', errorMessage, {
      recipientAddress: address,
    });
  }

  async trackBalanceValidation(
    errorMessage: string,
    currentBalance?: string,
    requestedAmount?: string
  ): Promise<void> {
    await this.trackError('balance', 'balance', errorMessage, {
      currentBalance: currentBalance,
      requestedAmount: requestedAmount,
    });
  }

  async trackNetworkValidation(errorMessage: string, network?: string): Promise<void> {
    await this.trackError('network', 'network', errorMessage, { network });
  }
}
