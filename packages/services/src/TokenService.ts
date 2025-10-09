import {
  UserFtTokensService,
  type CadenceFTApiResponseWithCurrency,
  type CurrencyEVMTokenData,
} from '@onflow/frw-api';
import { getServiceContext, type PlatformSpec } from '@onflow/frw-context';
import {
  mapCadenceTokenDataWithCurrencyToTokenModel,
  mapERC20TokenToTokenModel,
  WalletType,
  type TokenModel,
  FRWError,
  ErrorCode,
} from '@onflow/frw-types';
import { logger } from '@onflow/frw-utils';

/**
 * TokenProvider is an interface that defines the methods for a token provider.
 */
interface TokenProvider {
  getData(address: string, network?: string, currency?: string): Promise<unknown>;
  processData(data: unknown): TokenModel[];
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
      throw new FRWError(ErrorCode.TOKEN_FLOW_FETCH_FAILED, 'Failed to fetch Flow token data', {
        address,
        network,
        currency,
      });
    }
  }

  processData(data: unknown): TokenModel[] {
    const typedData = data as CadenceFTApiResponseWithCurrency | undefined;

    if (!typedData) {
      logger.warn('[FlowTokenProvider] No data to process');
      return [];
    }

    const mappedTokens = typedData?.result?.map((token) =>
      mapCadenceTokenDataWithCurrencyToTokenModel(token)
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
      throw new FRWError(ErrorCode.TOKEN_ERC20_FETCH_FAILED, 'Failed to fetch ERC20 token data', {
        address,
        network,
        currency,
      });
    }
  }

  processData(data: unknown): TokenModel[] {
    const typedData = data as CurrencyEVMTokenData[];

    if (!Array.isArray(typedData)) {
      logger.warn('[ERC20TokenProvider] Invalid data format, expected array');
      return [];
    }

    return typedData.map((token) => mapERC20TokenToTokenModel(token));
  }
}

/**
 * TokenService is a class that is used to get token information.
 */
export class TokenService {
  private static instances: Map<string, TokenService> = new Map();
  private tokenProvider: TokenProvider;
  private bridge?: PlatformSpec;

  constructor(type: WalletType, bridge?: PlatformSpec) {
    this.tokenProvider =
      type === WalletType.Flow ? new FlowTokenProvider() : new ERC20TokenProvider();

    // If bridge is not provided, try to get it from ServiceContext
    if (bridge) {
      this.bridge = bridge;
    } else {
      try {
        this.bridge = getServiceContext().bridge;
      } catch {
        logger.warn('[TokenService] ServiceContext not initialized, bridge will be null');
        this.bridge = undefined;
      }
    }
  }

  static getInstance(type: WalletType, bridge?: PlatformSpec): TokenService {
    const key = `${type}-${bridge ? 'with-bridge' : 'no-bridge'}`;

    if (!TokenService.instances.has(key)) {
      TokenService.instances.set(key, new TokenService(type, bridge));
    }

    return TokenService.instances.get(key)!;
  }

  async getTokenInfo(address: string, network?: string, currency?: string): Promise<TokenModel[]> {
    try {
      // Default to USD if no currency provided, as this seems to be required for balance data
      const defaultCurrency = currency || 'USD';

      const data = await this.tokenProvider.getData(address, network, defaultCurrency);
      return this.tokenProvider.processData(data);
    } catch (error) {
      logger.error('[TokenService] Failed to get token info:', error);
      // If it's already an FRWError, re-throw it directly
      if (error instanceof FRWError) {
        throw error;
      }
      throw new FRWError(ErrorCode.TOKEN_INFO_FETCH_FAILED, 'Failed to get token info', {
        address,
        network,
        currency,
      });
    }
  }
}
