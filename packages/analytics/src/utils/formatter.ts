import type {
  EventProperties,
  AnalyticsContext,
  EventName,
  EventData,
} from '../types.js';

export interface FormattingRules {
  timestampFormat?: 'unix' | 'iso' | 'relative';
  currencyFormat?: 'usd' | 'crypto' | 'raw';
  addressFormat?: 'full' | 'short' | 'masked';
  numberPrecision?: number;
  includeMetadata?: boolean;
  customFormatters?: Record<string, (value: unknown) => unknown>;
}

export class EventFormatter {
  private rules: Required<FormattingRules>;

  constructor(rules: FormattingRules = {}) {
    this.rules = {
      timestampFormat: rules.timestampFormat ?? 'unix',
      currencyFormat: rules.currencyFormat ?? 'usd',
      addressFormat: rules.addressFormat ?? 'short',
      numberPrecision: rules.numberPrecision ?? 6,
      includeMetadata: rules.includeMetadata ?? true,
      customFormatters: rules.customFormatters ?? {},
    };
  }

  formatEvent<T extends EventName>(
    eventName: T,
    eventData: EventData<T>,
    context: AnalyticsContext = {}
  ): {
    eventName: string;
    properties: EventProperties;
    metadata?: Record<string, unknown>;
  } {
    const formattedProperties = this.formatProperties(eventData as EventProperties);
    const metadata = this.rules.includeMetadata ? this.createMetadata(context) : undefined;

    return {
      eventName: this.formatEventName(eventName),
      properties: formattedProperties,
      metadata,
    };
  }

  formatEventName(eventName: EventName): string {
    return eventName
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }

  formatProperties(properties: EventProperties): EventProperties {
    const formatted: EventProperties = {};

    for (const [key, value] of Object.entries(properties)) {
      const customFormatter = this.rules.customFormatters[key];
      if (customFormatter) {
        const result = customFormatter(value);
        formatted[key] =
          typeof result === 'string' ||
          typeof result === 'number' ||
          typeof result === 'boolean' ||
          result === null ||
          result === undefined
            ? result
            : String(result);
        continue;
      }

      formatted[key] = this.formatValue(key, value);
    }

    return formatted;
  }

  private formatValue(key: string, value: unknown): string | number | boolean | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }

    if (this.isTimestampKey(key)) {
      return this.formatTimestamp(value);
    }

    if (this.isCurrencyKey(key)) {
      return this.formatCurrency(value);
    }

    if (this.isAddressKey(key)) {
      return this.formatAddress(value);
    }

    if (this.isAmountKey(key)) {
      return this.formatAmount(value);
    }

    if (this.isDurationKey(key)) {
      return this.formatDuration(value);
    }

    if (typeof value === 'number') {
      return this.formatNumber(value);
    }

    if (typeof value === 'string' || typeof value === 'boolean') {
      return value;
    }

    return String(value);
  }

  private isTimestampKey(key: string): boolean {
    return /timestamp|time|created|updated|start|end/i.test(key);
  }

  private isCurrencyKey(key: string): boolean {
    return /usd|price|value|cost|fee/i.test(key) && !key.includes('_ms');
  }

  private isAddressKey(key: string): boolean {
    return /address|hash|id/i.test(key) && typeof key === 'string';
  }

  private isAmountKey(key: string): boolean {
    return /amount|balance|quantity/i.test(key) && !key.includes('_ms');
  }

  private isDurationKey(key: string): boolean {
    return /_ms$|duration/i.test(key);
  }

  private formatTimestamp(value: unknown): string | number {
    if (typeof value !== 'number') {
      return String(value);
    }

    switch (this.rules.timestampFormat) {
      case 'iso':
        return new Date(value).toISOString();
      case 'relative':
        return this.getRelativeTime(value);
      case 'unix':
      default:
        return Math.floor(value / 1000);
    }
  }

  private formatCurrency(value: unknown): string {
    const numValue = this.parseNumber(value);
    if (numValue === null) return String(value);

    switch (this.rules.currencyFormat) {
      case 'usd':
        return `$${numValue.toFixed(2)}`;
      case 'crypto':
        return numValue.toFixed(this.rules.numberPrecision);
      case 'raw':
      default:
        return numValue.toString();
    }
  }

  private formatAddress(value: unknown): string {
    const strValue = String(value);

    switch (this.rules.addressFormat) {
      case 'short':
        if (strValue.length > 12) {
          return `${strValue.slice(0, 6)}...${strValue.slice(-4)}`;
        }
        return strValue;
      case 'masked':
        if (strValue.length > 8) {
          return `${strValue.slice(0, 4)}****${strValue.slice(-4)}`;
        }
        return strValue;
      case 'full':
      default:
        return strValue;
    }
  }

  private formatAmount(value: unknown): string {
    const numValue = this.parseNumber(value);
    if (numValue === null) return String(value);

    if (numValue === 0) return '0';
    if (numValue < 0.000001) return '<0.000001';
    if (numValue >= 1000000) {
      return `${(numValue / 1000000).toFixed(2)}M`;
    }
    if (numValue >= 1000) {
      return `${(numValue / 1000).toFixed(2)}K`;
    }

    return numValue.toFixed(this.rules.numberPrecision);
  }

  private formatDuration(value: unknown): string {
    const numValue = this.parseNumber(value);
    if (numValue === null) return String(value);

    if (numValue < 1000) return `${numValue}ms`;
    if (numValue < 60000) return `${(numValue / 1000).toFixed(1)}s`;
    if (numValue < 3600000) return `${(numValue / 60000).toFixed(1)}m`;

    return `${(numValue / 3600000).toFixed(1)}h`;
  }

  private formatNumber(value: number): number {
    if (!Number.isFinite(value)) return 0;

    if (Number.isInteger(value)) return value;

    return (
      Math.round(value * Math.pow(10, this.rules.numberPrecision)) /
      Math.pow(10, this.rules.numberPrecision)
    );
  }

  private parseNumber(value: unknown): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const absDiff = Math.abs(diff);

    if (absDiff < 60000) return 'just now';
    if (absDiff < 3600000) return `${Math.floor(absDiff / 60000)}m ago`;
    if (absDiff < 86400000) return `${Math.floor(absDiff / 3600000)}h ago`;
    if (absDiff < 2592000000) return `${Math.floor(absDiff / 86400000)}d ago`;

    return `${Math.floor(absDiff / 2592000000)}mo ago`;
  }

  private createMetadata(context: AnalyticsContext): Record<string, unknown> {
    return {
      platform: context.platform,
      version: context.version,
      environment: context.environment,
      timestamp: Date.now(),
      session_id: context.sessionId,
      user_id: context.userId,
      device_id: context.deviceId,
    };
  }
}

export const defaultFormatter = new EventFormatter();

export function formatEventForMixpanel<T extends EventName>(
  eventName: T,
  eventData: EventData<T>,
  context: AnalyticsContext = {}
): { eventName: string; properties: EventProperties } {
  const formatter = new EventFormatter({
    timestampFormat: 'unix',
    currencyFormat: 'raw',
    addressFormat: 'short',
    numberPrecision: 6,
    includeMetadata: true,
  });

  return formatter.formatEvent(eventName, eventData, context);
}

export function formatEventForConsole<T extends EventName>(
  eventName: T,
  eventData: EventData<T>,
  context: AnalyticsContext = {}
): { eventName: string; properties: EventProperties; metadata: Record<string, unknown> } {
  const formatter = new EventFormatter({
    timestampFormat: 'iso',
    currencyFormat: 'usd',
    addressFormat: 'short',
    numberPrecision: 2,
    includeMetadata: true,
  });

  const result = formatter.formatEvent(eventName, eventData, context);
  return {
    ...result,
    metadata: result.metadata || {},
  };
}

export function formatEventForDebug<T extends EventName>(
  eventName: T,
  eventData: EventData<T>,
  context: AnalyticsContext = {}
): { eventName: string; properties: EventProperties; metadata: Record<string, unknown> } {
  const formatter = new EventFormatter({
    timestampFormat: 'relative',
    currencyFormat: 'crypto',
    addressFormat: 'full',
    numberPrecision: 8,
    includeMetadata: true,
    customFormatters: {
      duration_ms: (value) => {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        if (Number.isNaN(num)) return value;
        return `${num}ms (${(num / 1000).toFixed(2)}s)`;
      },
      gas_fee: (value) => {
        const num = typeof value === 'number' ? value : parseFloat(String(value));
        if (Number.isNaN(num)) return value;
        return `${num} FLOW`;
      },
    },
  });

  const result = formatter.formatEvent(eventName, eventData, context);
  return {
    ...result,
    metadata: result.metadata || {},
  };
}

export function createCustomFormatter(rules: FormattingRules): EventFormatter {
  return new EventFormatter(rules);
}
