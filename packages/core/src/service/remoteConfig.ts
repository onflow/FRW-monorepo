import {
  type RemoteConfig,
  remoteConfigKey,
  remoteConfigRefreshRegex,
  getValidData,
  registerRefreshListener,
  setCachedData,
} from '@onflow/frw-data-model';

import { type FeatureFlagKey, type FeatureFlags } from '@onflow/frw-shared/types';

import openapi from './openapi';

class RemoteConfigService {
  init = async () => {
    registerRefreshListener(remoteConfigRefreshRegex, this.loadRemoteConfig);
  };

  loadRemoteConfig = async (): Promise<RemoteConfig> => {
    const result = await openapi.fetchRemoteConfig();

    const config = result;

    setCachedData(remoteConfigKey(), config, 600_000); // 10 minutes
    return config;
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
    return fullConfig.config.features[featureFlag];
  };
}

export default new RemoteConfigService();
