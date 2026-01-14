import type { EventProperties, UserProperties } from '../types.js';

export interface SanitizationRules {
  maxStringLength?: number;
  maxObjectDepth?: number;
  allowedTypes?: Array<'string' | 'number' | 'boolean'>;
  sensitivePatterns?: RegExp[];
  blockedKeys?: string[];
  transformers?: Record<string, (value: unknown) => unknown>;
}

export class DataSanitizer {
  private rules: Required<SanitizationRules>;

  constructor(rules: SanitizationRules = {}) {
    this.rules = {
      maxStringLength: rules.maxStringLength ?? 500,
      maxObjectDepth: rules.maxObjectDepth ?? 3,
      allowedTypes: rules.allowedTypes ?? ['string', 'number', 'boolean'],
      sensitivePatterns: rules.sensitivePatterns ?? [
        /password/i,
        /secret/i,
        /token/i,
        /key/i,
        /auth/i,
        /credential/i,
        /private/i,
        /seed/i,
        /mnemonic/i,
        /recovery/i,
        /phrase/i,
        /wallet/i,
      ],
      blockedKeys: rules.blockedKeys ?? [
        'password',
        'secret',
        'token',
        'privateKey',
        'seedPhrase',
        'mnemonic',
        'recoveryPhrase',
        'auth',
        'credential',
        'apiKey',
      ],
      transformers: rules.transformers ?? {},
    };
  }

  sanitizeProperties(properties: EventProperties | undefined): EventProperties {
    if (!properties || typeof properties !== 'object') {
      return {};
    }

    return this.sanitizeObject(properties, 0) as EventProperties;
  }

  sanitizeUserProperties(properties: UserProperties | undefined): UserProperties {
    if (!properties || typeof properties !== 'object') {
      return {};
    }

    return this.sanitizeObject(properties, 0) as UserProperties;
  }

  private sanitizeObject(obj: Record<string, unknown>, depth: number): Record<string, unknown> {
    if (depth >= this.rules.maxObjectDepth) {
      return { __truncated: `Object too deep (max depth: ${this.rules.maxObjectDepth})` };
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (this.isBlockedKey(key)) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      if (this.hasSensitiveContent(key, value)) {
        sanitized[key] = '[SENSITIVE]';
        continue;
      }

      const transformer = this.rules.transformers[key];
      if (transformer) {
        try {
          sanitized[key] = transformer(value);
          continue;
        } catch (error) {
          sanitized[key] = '[TRANSFORM_ERROR]';
          continue;
        }
      }

      sanitized[key] = this.sanitizeValue(value, depth + 1);
    }

    return sanitized;
  }

  private sanitizeValue(value: unknown, depth: number): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    const valueType = typeof value;

    if (!this.rules.allowedTypes.includes(valueType as any)) {
      if (valueType === 'object') {
        if (Array.isArray(value)) {
          return this.sanitizeArray(value, depth);
        }
        return this.sanitizeObject(value as Record<string, unknown>, depth);
      }
      return String(value);
    }

    if (valueType === 'string') {
      return this.sanitizeString(value as string);
    }

    if (valueType === 'number') {
      return this.sanitizeNumber(value as number);
    }

    return value;
  }

  private sanitizeArray(arr: unknown[], depth: number): unknown[] {
    if (depth >= this.rules.maxObjectDepth) {
      return ['[ARRAY_TOO_DEEP]'];
    }

    return arr.map((item) => this.sanitizeValue(item, depth)).slice(0, 100);
  }

  private sanitizeString(str: string): string {
    if (str.length > this.rules.maxStringLength) {
      return str.slice(0, this.rules.maxStringLength) + '[TRUNCATED]';
    }

    for (const pattern of this.rules.sensitivePatterns) {
      if (pattern.test(str)) {
        return '[SENSITIVE_STRING]';
      }
    }

    return str;
  }

  private sanitizeNumber(num: number): number {
    if (!Number.isFinite(num)) {
      return 0;
    }

    if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
      return num > 0 ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
    }

    return num;
  }

  private isBlockedKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.rules.blockedKeys.some((blockedKey) => lowerKey.includes(blockedKey.toLowerCase()));
  }

  private hasSensitiveContent(key: string, value: unknown): boolean {
    if (typeof value === 'string') {
      for (const pattern of this.rules.sensitivePatterns) {
        if (pattern.test(key) || pattern.test(value)) {
          return true;
        }
      }
    }

    return false;
  }
}

export const defaultSanitizer = new DataSanitizer();

export function sanitizeEventProperties(properties?: EventProperties): EventProperties {
  return defaultSanitizer.sanitizeProperties(properties);
}

export function sanitizeUserProperties(properties?: UserProperties): UserProperties {
  return defaultSanitizer.sanitizeUserProperties(properties);
}

export function createCustomSanitizer(rules: SanitizationRules): DataSanitizer {
  return new DataSanitizer(rules);
}

export const walletSanitizer = createCustomSanitizer({
  maxStringLength: 300,
  maxObjectDepth: 2,
  sensitivePatterns: [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /auth/i,
    /credential/i,
    /private/i,
    /seed/i,
    /mnemonic/i,
    /recovery/i,
    /phrase/i,
    /wallet.*address/i,
    /balance/i,
    /amount/i,
  ],
  blockedKeys: [
    'password',
    'secret',
    'token',
    'privateKey',
    'seedPhrase',
    'mnemonic',
    'recoveryPhrase',
    'auth',
    'credential',
    'apiKey',
    'walletAddress',
    'accountAddress',
    'fullBalance',
  ],
  transformers: {
    amount: (value) => {
      if (typeof value === 'string' || typeof value === 'number') {
        const num = parseFloat(String(value));
        return Number.isNaN(num) ? 0 : Math.round(num * 100) / 100;
      }
      return value;
    },
    address: (value) => {
      if (typeof value === 'string' && value.length > 8) {
        return `${value.slice(0, 6)}...${value.slice(-4)}`;
      }
      return value;
    },
    transaction_hash: (value) => {
      if (typeof value === 'string' && value.length > 12) {
        return `${value.slice(0, 8)}...${value.slice(-4)}`;
      }
      return value;
    },
  },
});

export const debugSanitizer = createCustomSanitizer({
  maxStringLength: 1000,
  maxObjectDepth: 5,
  allowedTypes: ['string', 'number', 'boolean'],
  sensitivePatterns: [/password/i, /secret/i, /privateKey/i, /seedPhrase/i, /mnemonic/i],
  blockedKeys: ['password', 'secret', 'privateKey', 'seedPhrase', 'mnemonic'],
});

export const productionSanitizer = createCustomSanitizer({
  maxStringLength: 200,
  maxObjectDepth: 2,
  allowedTypes: ['string', 'number', 'boolean'],
  sensitivePatterns: [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /auth/i,
    /credential/i,
    /private/i,
    /seed/i,
    /mnemonic/i,
    /recovery/i,
    /phrase/i,
    /wallet/i,
    /balance/i,
    /amount/i,
    /address/i,
    /hash/i,
  ],
  blockedKeys: [
    'password',
    'secret',
    'token',
    'privateKey',
    'seedPhrase',
    'mnemonic',
    'recoveryPhrase',
    'auth',
    'credential',
    'apiKey',
    'address',
    'walletAddress',
    'accountAddress',
    'balance',
    'amount',
    'transactionHash',
  ],
});
