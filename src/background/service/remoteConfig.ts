import { type FeatureFlagKey, type FeatureFlags } from '@/shared/types/feature-types';
import {
  type RemoteConfig,
  remoteConfigKey,
  remoteConfigRefreshRegex,
} from '@/shared/utils/cache-data-keys';

import { getValidData, registerRefreshListener, setCachedData } from '../utils/data-cache';

import openapi from './openapi';

class RemoteConfigService {
  init = async () => {
    registerRefreshListener(remoteConfigRefreshRegex, this.loadRemoteConfig);
  };

  loadRemoteConfig = async (): Promise<RemoteConfig> => {
    const result = await openapi.sendRequest(
      'GET',
      process.env.API_CONFIG_PATH,
      {},
      {},
      process.env.API_BASE_URL
    );

    const config = result.config;

    setCachedData(remoteConfigKey(), config, 600_000); // 10 minutes
    return config;
  };

  getRemoteConfig = async (): Promise<RemoteConfig> => {
    const config = await getValidData<RemoteConfig>(remoteConfigKey());
    if (!config) {
      return this.loadRemoteConfig();
    }
    return config;
  };

  getFeatureFlags = async (): Promise<FeatureFlags> => {
    const config = await this.getRemoteConfig();
    return config.features;
  };

  getFeatureFlag = async (featureFlag: FeatureFlagKey): Promise<boolean> => {
    const config = await this.getRemoteConfig();
    return config.features[featureFlag];
  };
}

export default new RemoteConfigService();
