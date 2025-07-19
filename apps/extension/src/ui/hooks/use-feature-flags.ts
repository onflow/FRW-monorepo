import { type RemoteConfig, remoteConfigKey } from '@onflow/flow-wallet-data-model';

import { type FeatureFlagKey } from '@onflow/flow-wallet-shared/types';

import { useCachedData } from './use-data';

export const useFeatureFlags = () => {
  const remoteConfig = useCachedData<RemoteConfig>(remoteConfigKey());
  return remoteConfig?.config.features;
};

export const useFeatureFlag = (featureFlag: FeatureFlagKey) => {
  const remoteConfig = useCachedData<RemoteConfig>(remoteConfigKey());
  return remoteConfig?.config.features[featureFlag] || false;
};

export const useLatestVersion = () => {
  const remoteConfig = useCachedData<RemoteConfig>(remoteConfigKey());
  return remoteConfig?.version;
};
