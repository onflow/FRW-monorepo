import {
  type RemoteConfig,
  remoteConfigKey,
  remoteConfigRefreshRegex,
  getValidData,
  registerRefreshListener,
  setCachedData,
} from '@/data-model';
import { type FeatureFlagKey, type FeatureFlags } from '@/shared/types';
import { consoleError } from '@/shared/utils';

// Snapshot of web-next /config/config.json (2026-10-27). Used whenever the fetch fails so boot,
// payer selection and feature flags never depend on the config endpoint being up.
import defaultRemoteConfig from './default-remote-config.json';
import openapi from './openapi';

export const DEFAULT_REMOTE_CONFIG = defaultRemoteConfig as unknown as RemoteConfig;

class RemoteConfigService {
  init = async () => {
    registerRefreshListener(remoteConfigRefreshRegex, this.loadRemoteConfig);
  };

  loadRemoteConfig = async (): Promise<RemoteConfig> => {
    try {
      const result = await openapi.fetchRemoteConfig();
      if (!result?.config?.features || !result?.config?.payer) {
        throw new Error('Remote config response is missing config.features or config.payer');
      }
      setCachedData(remoteConfigKey(), result, 600_000); // 10 minutes
      return result;
    } catch (error) {
      consoleError('Remote config unavailable, using bundled defaults', error);
      // Cache the defaults briefly so we retry the endpoint soon without hammering it
      setCachedData(remoteConfigKey(), DEFAULT_REMOTE_CONFIG, 60_000);
      return DEFAULT_REMOTE_CONFIG;
    }
  };

  getRemoteConfig = async (): Promise<RemoteConfig> => {
    const fullConfig = await getValidData<RemoteConfig>(remoteConfigKey());
    if (!fullConfig) {
      return this.loadRemoteConfig();
    }
    return fullConfig;
  };

  getFeatureFlags = async (): Promise<FeatureFlags> => {
    const fullConfig = await this.getRemoteConfig();
    return fullConfig.config.features;
  };

  getFeatureFlag = async (featureFlag: FeatureFlagKey): Promise<boolean> => {
    const fullConfig = await this.getRemoteConfig();
    return (
      fullConfig.config.features[featureFlag] ??
      DEFAULT_REMOTE_CONFIG.config.features[featureFlag] ??
      false
    );
  };
}

export default new RemoteConfigService();
