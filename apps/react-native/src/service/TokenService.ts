import { UserFtTokensService } from '@/network';
import type { CadenceFTApiResponseWithCurrency, CurrencyEVMTokenData } from '@/network/api/service';
import {
  mapCadenceTokenDataWithCurrencyToTokenInfo,
  mapERC20TokenToTokenInfo,
  TokenInfo,
} from '@/types/TokenInfo';
import { WalletType } from '@/types/Wallet';

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
      console.error('[FlowTokenProvider] Failed to fetch token data:', error);
      return undefined;
    }
  }

  processData(data: unknown): TokenInfo[] {
    const typedData = data as CadenceFTApiResponseWithCurrency | undefined;

    if (!typedData) {
      console.warn('[FlowTokenProvider] No data to process');
      return [];
    }

    const mappedTokens = typedData?.result?.map(token =>
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
      console.error('[ERC20TokenProvider] Failed to fetch token data:', error);
      return [];
    }
  }

  processData(data: unknown): TokenInfo[] {
    const typedData = data as CurrencyEVMTokenData[];

    if (!Array.isArray(typedData)) {
      console.warn('[ERC20TokenProvider] Invalid data format, expected array');
      return [];
    }

    return typedData.map(token => mapERC20TokenToTokenInfo(token));
  }
}

/**
 * TokenService is a class that is used to get token information.
 */
export class TokenService {
  private tokenProvider: TokenProvider;
  constructor(type: WalletType) {
    this.tokenProvider =
      type === WalletType.Flow ? new FlowTokenProvider() : new ERC20TokenProvider();
  }

  async getTokenInfo(address: string, network?: string, currency?: string): Promise<TokenInfo[]> {
    try {
      // Default to USD if no currency provided, as this seems to be required for balance data
      const defaultCurrency = currency || 'USD';

      const data = await this.tokenProvider.getData(address, network, defaultCurrency);
      return this.tokenProvider.processData(data);
    } catch (error) {
      console.error('[TokenService] Failed to get token info:', error);
      return [];
    }
  }
}
