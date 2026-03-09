import { EvmService } from '@onflow/frw-api';
import { tokenQueries } from '@onflow/frw-stores';
import type { CollectionModel, MigrationAssetsData, NFTModel, TokenModel } from '@onflow/frw-types';
import { validateEvmAddress } from '@onflow/frw-utils';

type Logger = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  ...args: unknown[]
) => void;

interface MigrationAssetsServiceDeps {
  getNetwork: () => string;
  log: Logger;
}

export class MigrationAssetsService {
  private static readonly ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  private readonly getNetwork: () => string;
  private readonly log: Logger;

  constructor(deps: MigrationAssetsServiceDeps) {
    this.getNetwork = deps.getNetwork;
    this.log = deps.log;
  }

  async getMigrationAssets(
    sourceAddress: string,
    fallback?: () => Promise<MigrationAssetsData>
  ): Promise<MigrationAssetsData> {
    try {
      const assets = await this.buildAssets(sourceAddress);
      return this.normalizeMigrationAssets(assets);
    } catch (error) {
      this.log('error', '[MigrationAssetsService] Failed to build migration assets', error);
      if (fallback) {
        try {
          const raw = await fallback();
          return this.normalizeMigrationAssets(raw);
        } catch (fallbackError) {
          this.log(
            'error',
            '[MigrationAssetsService] Failed to load migration assets from fallback',
            fallbackError
          );
        }
      }
      return { erc20: [], erc721: [], erc1155: [] };
    }
  }

  private async buildAssets(sourceAddress: string): Promise<MigrationAssetsData> {
    const migrationAssets: MigrationAssetsData = {
      erc20: [],
      erc721: [],
      erc1155: [],
    };

    const network = this.getNetwork();
    const isEvmAddress = validateEvmAddress(sourceAddress);

    let soulBoundAddresses: string[] = [];
    try {
      const soulBoundResponse = await EvmService.soulBound();
      soulBoundAddresses = (soulBoundResponse?.data || []).map((addr: string) =>
        addr.toLowerCase()
      );
    } catch (error) {
      this.log(
        'warn',
        '[MigrationAssetsService] Failed to fetch soul bound addresses, continuing without filter',
        error
      );
    }

    let tokens: TokenModel[] = [];
    try {
      tokens = await tokenQueries.fetchTokens(sourceAddress, network);
    } catch (error) {
      this.log('error', '[MigrationAssetsService] Failed to fetch tokens for migration', error);
    }

    if (tokens.length > 0) {
      migrationAssets.erc20 = tokens
        .map(token => {
          const evmAddress = token.evmAddress || token.contractAddress || '';
          const balanceStr = token.balance || token.displayBalance || '0';

          if (evmAddress.startsWith('0x')) {
            const decimals = token.decimal ?? 18;
            const rawAmount = MigrationAssetsService.toScaledIntegerString(balanceStr, decimals);
            if (!rawAmount || rawAmount.replace(/^0+/, '') === '') {
              return null;
            }
            return {
              address: evmAddress,
              amount: rawAmount,
            };
          }

          if (MigrationAssetsService.isFlowToken(token)) {
            const scaled = MigrationAssetsService.toScaledIntegerString(balanceStr, 8);
            if (!scaled || scaled.replace(/^0+/, '') === '') {
              return null;
            }
            const truncated = MigrationAssetsService.formatScaledInteger(scaled, 8);
            return {
              address: MigrationAssetsService.ZERO_ADDRESS,
              amount: truncated,
            };
          }

          return null;
        })
        .filter((asset): asset is { address: string; amount: string } => asset !== null);
    }

    if (isEvmAddress) {
      let collections: CollectionModel[] = [];
      try {
        collections = await tokenQueries.fetchNFTCollections(sourceAddress, network);
      } catch (error) {
        this.log('error', '[MigrationAssetsService] Failed to fetch NFT collections', error);
      }

      for (const collection of collections) {
        const contractAddress = collection.evmAddress || collection.address || '';
        if (!contractAddress.startsWith('0x') || !validateEvmAddress(contractAddress)) {
          continue;
        }

        if (soulBoundAddresses.includes(contractAddress.toLowerCase())) {
          continue;
        }

        const isERC1155 = (collection.contractType || '').toUpperCase() === 'ERC1155';

        let nfts: NFTModel[] = [];
        try {
          nfts = await tokenQueries.fetchAllNFTsFromCollection(
            sourceAddress,
            collection,
            network,
            collection.count
          );
        } catch (error) {
          this.log(
            'error',
            '[MigrationAssetsService] Failed to fetch NFTs from collection',
            contractAddress,
            error
          );
          continue;
        }

        const nftIds = nfts
          .map(nft => nft.id)
          .filter((id): id is string => !!id && MigrationAssetsService.isIntegerString(id));

        if (nftIds.length === 0) {
          continue;
        }

        if (isERC1155) {
          migrationAssets.erc1155.push(
            ...nftIds.map(id => {
              const nft = nfts.find(item => item.id === id);
              const amount =
                nft?.amount && MigrationAssetsService.isIntegerString(nft.amount)
                  ? nft.amount
                  : '1';
              return {
                address: contractAddress,
                id,
                amount,
              };
            })
          );
        } else {
          migrationAssets.erc721.push(
            ...nftIds.map(id => ({
              address: contractAddress,
              id,
            }))
          );
        }
      }
    }

    return migrationAssets;
  }

  private normalizeMigrationAssets(raw: any): MigrationAssetsData {
    const toArray = (value: any): any[] => (Array.isArray(value) ? value : []);
    const toString = (value: any): string =>
      value === undefined || value === null ? '' : String(value);
    const isPositiveDecimalString = (value: string): boolean =>
      /^[0-9]+(\.[0-9]+)?$/.test(value) && Number(value) > 0;
    const normalizeAddress = (value: any): string => {
      const addr = toString(value);
      if (!addr) {
        return '';
      }
      return addr.startsWith('0x') ? addr : `0x${addr}`;
    };

    const rawErc20 = toArray(raw?.erc20);
    const rawErc721 = toArray(raw?.erc721);
    const rawErc1155 = toArray(raw?.erc1155);

    const erc20 = rawErc20
      .map(asset => ({
        address: normalizeAddress(asset?.address),
        amount: toString(asset?.amount),
      }))
      .filter(
        asset =>
          asset.address &&
          (asset.address === MigrationAssetsService.ZERO_ADDRESS ||
            validateEvmAddress(asset.address)) &&
          isPositiveDecimalString(asset.amount)
      );

    const erc721 = rawErc721
      .map(asset => ({
        address: normalizeAddress(asset?.address),
        id: toString(asset?.id),
      }))
      .filter(
        asset =>
          asset.address &&
          validateEvmAddress(asset.address) &&
          asset.id.length > 0 &&
          MigrationAssetsService.isIntegerString(asset.id)
      );

    const erc1155 = rawErc1155
      .map(asset => ({
        address: normalizeAddress(asset?.address),
        id: toString(asset?.id),
        amount: toString(asset?.amount),
      }))
      .filter(
        asset =>
          asset.address &&
          validateEvmAddress(asset.address) &&
          asset.id.length > 0 &&
          MigrationAssetsService.isIntegerString(asset.id) &&
          isPositiveDecimalString(asset.amount)
      );

    const dropped =
      rawErc20.length +
      rawErc721.length +
      rawErc1155.length -
      (erc20.length + erc721.length + erc1155.length);
    if (dropped > 0) {
      this.log(
        'warn',
        `[MigrationAssetsService] Dropped ${dropped} invalid migration asset(s) during normalization`
      );
    }

    return { erc20, erc721, erc1155 };
  }

  private static normalizeNumericString(input: string): string | null {
    const raw = input?.trim();
    if (!raw) {
      return null;
    }
    const lower = raw.toLowerCase();
    if (
      lower === 'deprecated' ||
      lower === 'n/a' ||
      lower === 'null' ||
      lower === 'undefined' ||
      lower === 'nan' ||
      lower === 'infinity' ||
      lower === '-infinity'
    ) {
      return null;
    }
    if (/^[+-]?\d+(\.\d+)?$/.test(lower)) {
      return lower;
    }
    const sciMatch = lower.match(/^([+-]?\d+(?:\.\d+)?)[eE]([+-]?\d+)$/);
    if (!sciMatch) {
      return null;
    }
    if (sciMatch[1].startsWith('-')) {
      return null;
    }
    const exponent = parseInt(sciMatch[2], 10);
    const [intPart, fracPart = ''] = sciMatch[1].split('.');
    const digits = `${intPart}${fracPart}`.replace(/^0+(?=\d)/, '');
    const safeDigits = digits === '' ? '0' : digits;
    const decimalPos = intPart.length;
    const newPos = decimalPos + exponent;
    if (newPos <= 0) {
      return `0.${'0'.repeat(-newPos)}${safeDigits}`;
    }
    if (newPos >= safeDigits.length) {
      return `${safeDigits}${'0'.repeat(newPos - safeDigits.length)}`;
    }
    return `${safeDigits.slice(0, newPos)}.${safeDigits.slice(newPos)}`;
  }

  private static toScaledIntegerString(value: string, decimals: number): string | null {
    const normalized = MigrationAssetsService.normalizeNumericString(value);
    if (!normalized || normalized.startsWith('-')) {
      return null;
    }
    const [whole, fraction = ''] = normalized.split('.');
    const paddedFraction = `${fraction}${'0'.repeat(decimals)}`.slice(0, decimals);
    const combined = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, '');
    return combined === '' ? '0' : combined;
  }

  private static formatScaledInteger(value: string, decimals: number): string {
    const digits = value.replace(/^0+(?=\d)/, '');
    const safeDigits = digits === '' ? '0' : digits;
    if (decimals <= 0) {
      return safeDigits;
    }
    const padded = safeDigits.padStart(decimals + 1, '0');
    const whole = padded.slice(0, -decimals);
    const fraction = padded.slice(-decimals);
    const trimmedFraction = fraction.replace(/0+$/, '');
    return trimmedFraction ? `${whole}.${trimmedFraction}` : whole;
  }

  private static isIntegerString(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  private static isFlowToken(token: TokenModel): boolean {
    const symbol = token.symbol?.toLowerCase() || '';
    const contractName = token.contractName?.toLowerCase() || '';
    const identifier = token.identifier?.toLowerCase() || '';
    const contractAddress = token.contractAddress || '';
    const isCadenceStFlow =
      contractAddress.includes('stFlowToken') ||
      contractAddress.includes('Vault') ||
      contractAddress.includes('A.d6f80565193ad727');
    return (
      !isCadenceStFlow &&
      (symbol === 'flow' ||
        contractName === 'flowtoken' ||
        identifier.includes('flowtoken') ||
        identifier.includes('flowtoken.vault'))
    );
  }
}
