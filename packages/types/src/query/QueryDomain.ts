/**
 * Query domain types and categories for TanStack Query integration
 * Defines data categorization for intelligent caching strategies
 */

// Define data categories with different caching strategies
export enum DataCategory {
  FINANCIAL = 'financial', // Balance, tokens, transactions - Real-time data
  USER_SETTINGS = 'settings', // Address book, preferences - Medium cache
  STATIC = 'static', // Token lists, chain info - Long cache
  PERSISTENT = 'persistent', // Data that never expires - Permanent cache
  SESSION = 'session', // Temporary session data - No persistence
}

// Query domain definitions with embedded category information
export const QueryDomain = {
  // Financial domains - real-time data (0ms cache)
  FINANCIAL: {
    TOKENS: 'tokens',
    BALANCE: 'balance',
    NFTS: 'nfts',
    TRANSACTIONS: 'transactions',
    PRICES: 'prices',
    ACCESSIBLE_ASSETS: 'accessible-assets',
    STORAGE: 'storage',
  },

  // User settings domains - medium cache (5min)
  USER_SETTINGS: {
    ADDRESSBOOK: 'addressbook',
    PREFERENCES: 'preferences',
    CONTACTS: 'contacts',
    RECENT: 'recent',
  },

  // Static domains - long cache (30min)
  STATIC: {
    SUPPORTED_TOKENS: 'supported-tokens',
    CHAIN_INFO: 'chain-info',
    NETWORK_CONFIG: 'network-config',
    CURRENCY_LIST: 'currency-list',
  },

  // Persistent domains - never expires (∞)
  PERSISTENT: {
    CONFIG: 'config',
    CONSTANTS: 'constants',
    METADATA: 'metadata',
    SCHEMAS: 'schemas',
    TRANSLATIONS: 'translations',
  },

  // Session domains - short cache (2min)
  SESSION: {
    SESSION: 'session',
    AUTH: 'auth',
    TEMP: 'temp',
  },
} as const;

// Flatten all domain values for easy access
export const FlatQueryDomain = {
  // Financial
  ...QueryDomain.FINANCIAL,
  // User Settings
  ...QueryDomain.USER_SETTINGS,
  // Static
  ...QueryDomain.STATIC,
  // Persistent
  ...QueryDomain.PERSISTENT,
  // Session
  ...QueryDomain.SESSION,
} as const;

// Type for all domain values
export type QueryDomainValue = (typeof FlatQueryDomain)[keyof typeof FlatQueryDomain];

// Helper function to get category from domain value
export const getDomainCategory = (domain: string): DataCategory => {
  // Check each category group
  if ((Object.values(QueryDomain.FINANCIAL) as string[]).includes(domain)) {
    return DataCategory.FINANCIAL;
  }
  if ((Object.values(QueryDomain.USER_SETTINGS) as string[]).includes(domain)) {
    return DataCategory.USER_SETTINGS;
  }
  if ((Object.values(QueryDomain.STATIC) as string[]).includes(domain)) {
    return DataCategory.STATIC;
  }
  if ((Object.values(QueryDomain.PERSISTENT) as string[]).includes(domain)) {
    return DataCategory.PERSISTENT;
  }
  if ((Object.values(QueryDomain.SESSION) as string[]).includes(domain)) {
    return DataCategory.SESSION;
  }

  // Default to financial (most restrictive) for unknown data
  return DataCategory.FINANCIAL;
};

// Cache time constants (in milliseconds)
export const CACHE_TIMES = {
  [DataCategory.FINANCIAL]: 0, // Always fresh
  [DataCategory.SESSION]: 2 * 60 * 1000, // 2 minutes
  [DataCategory.USER_SETTINGS]: 5 * 60 * 1000, // 5 minutes
  [DataCategory.STATIC]: 30 * 60 * 1000, // 30 minutes
  [DataCategory.PERSISTENT]: Infinity, // Never expires
} as const;

// GC time constants (how long to keep in memory after stale)
export const GC_TIMES = {
  [DataCategory.FINANCIAL]: 2 * 60 * 1000, // 2 minutes
  [DataCategory.USER_SETTINGS]: 10 * 60 * 1000, // 10 minutes
  [DataCategory.SESSION]: 30 * 1000, // 30 seconds
  [DataCategory.STATIC]: 60 * 60 * 1000, // 1 hour
  [DataCategory.PERSISTENT]: Infinity, // Never garbage collected
} as const;
