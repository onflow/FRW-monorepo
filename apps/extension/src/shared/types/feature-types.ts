// Example of features we use, but could be any string key as we add more
export type FeatureFlagKey =
  | 'free_gas'
  | 'swap'
  | 'tx_warning_prediction'
  | 'emulator_mode'
  | 'cover_bridge_fee'
  | 'create_new_account'
  | 'import_existing_account'
  | 'vault_entrance'
  | 'blocto_key_rotation'
  | 'coa_migration_v2'
  | 'cadence_inbox';

// Feature flags
export type FeatureFlags = {
  // Other feature flags
  [key: FeatureFlagKey | string]: boolean;
};
