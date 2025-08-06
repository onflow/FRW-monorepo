import {
  UserFtTokensService,
  type CadenceFTApiResponseWithCurrency,
  type CurrencyEVMTokenData,
} from '@onflow/frw-api';
import { getServiceContext, logger, type BridgeSpec } from '@onflow/frw-context';
import {
  mapCadenceTokenDataWithCurrencyToTokenInfo,
  mapERC20TokenToTokenInfo,
  WalletType,
  type TokenInfo,
} from '@onflow/frw-types';


/**
 * TokenProvider is an interface that defines the methods for a token provider.
 */
interface TokenProvider {
  getData(address: string, network?: string, currency?: string): Promise<unknown>;
  processData(data: unknown): TokenInfo[];
}
/**
 * FlowTokenProvider is a class that implements the TokenProvider interface.
 * It is used to get data from the Flow network.
 */
class FlowTokenProvider implements TokenProvider {
  async getData(
    address: string,
    network?: string,
    currency?: string
  ): Promise<CadenceFTApiResponseWithCurrency | undefined> {
    try {
      const res = await UserFtTokensService.ft({
        address,
        network,
        currency,
      });

      return res?.data;
    } catch (error) {
      logger.error('[FlowTokenProvider] Failed to fetch token data:', error);
      return undefined;
    }
  }

  processData(data: unknown): TokenInfo[] {
    const typedData = data as CadenceFTApiResponseWithCurrency | undefined;

    if (!typedData) {
      logger.warn('[FlowTokenProvider] No data to process');
      return [];
    }

    const mappedTokens = typedData?.result?.map((token) =>
      mapCadenceTokenDataWithCurrencyToTokenInfo(token)
    );
    // availableBalanceToUse
    return mappedTokens ?? [];
  }
}

/**
 * ERC20TokenProvider is a class that implements the TokenProvider interface.
 * It is used to get data from the ERC20 network.
 */
class ERC20TokenProvider implements TokenProvider {
  async getData(
    address: string,
    network?: string,
    currency?: string
  ): Promise<CurrencyEVMTokenData[]> {
    try {
      const res = await UserFtTokensService.ft1({
        address,
        network,
        currency,
      });

      return res?.data ?? [];
    } catch (error) {
      logger.error('[ERC20TokenProvider] Failed to fetch token data:', error);
      return [];
    }
  }

  processData(data: unknown): TokenInfo[] {
    const typedData = data as CurrencyEVMTokenData[];

    if (!Array.isArray(typedData)) {
      logger.warn('[ERC20TokenProvider] Invalid data format, expected array');
      return [];
    }

    return typedData.map((token) => mapERC20TokenToTokenInfo(token));
  }
}

/**
 * TokenService is a class that is used to get token information.
 */
export class TokenService {
  private static instances: Map<string, TokenService> = new Map();
  private tokenProvider: TokenProvider;
  private bridge?: BridgeSpec;

  constructor(type: WalletType, bridge?: BridgeSpec) {
    this.tokenProvider =
      type === WalletType.Flow ? new FlowTokenProvider() : new ERC20TokenProvider();

    // If bridge is not provided, try to get it from ServiceContext
    if (bridge) {
      this.bridge = bridge;
    } else {
      try {
        this.bridge = getServiceContext().bridge;
      } catch (error) {
        logger.warn('[TokenService] ServiceContext not initialized, bridge will be null');
        this.bridge = undefined;
      }
    }
  }

  static getInstance(type: WalletType, bridge?: BridgeSpec): TokenService {
    const key = `${type}-${bridge ? 'with-bridge' : 'no-bridge'}`;

    if (!TokenService.instances.has(key)) {
      TokenService.instances.set(key, new TokenService(type, bridge));
    }

    return TokenService.instances.get(key)!;
  }

  async getTokenInfo(address: string, network?: string, currency?: string): Promise<TokenInfo[]> {
    try {
      // Default to USD if no currency provided, as this seems to be required for balance data
      const defaultCurrency = currency || 'USD';

      const data = await this.tokenProvider.getData(address, network, defaultCurrency);
      return this.tokenProvider.processData(data);
    } catch (error) {
      logger.error('[TokenService] Failed to get token info:', error);
      return [];
    }
  }
}
