import {
  supportedCurrenciesKey,
  type SupportedCurrenciesStore,
  preferencesKey,
  type PreferencesStore,
  getUserData,
  setUserData,
} from '@onflow/flow-wallet-data-model';

import { DEFAULT_CURRENCY } from '@onflow/flow-wallet-shared/constant';

import { useCachedData, useUserData } from './use-data';

export const useCurrency = () => {
  const preferences = useUserData<PreferencesStore>(preferencesKey);
  return preferences?.displayCurrency;
};

export const useSupportedCurrencies = () => {
  return useCachedData<SupportedCurrenciesStore>(supportedCurrenciesKey());
};

export const useHiddenAccounts = () => {
  const preferences = useUserData<PreferencesStore>(preferencesKey);
  return preferences?.hiddenAccounts || [];
};

export const useAccountHidden = (address: string) => {
  const hiddenAccounts = useHiddenAccounts();
  return hiddenAccounts.includes(address);
};

export const toggleAccountHidden = async (address: string) => {
  const preferences = await getUserData<PreferencesStore>(preferencesKey);
  const currentHiddenAccounts = preferences?.hiddenAccounts || [];

  const newHiddenAccounts = currentHiddenAccounts.includes(address)
    ? currentHiddenAccounts.filter((addr) => addr !== address)
    : [...currentHiddenAccounts, address];

  await setUserData<PreferencesStore>(preferencesKey, {
    ...preferences,
    displayCurrency: preferences?.displayCurrency || DEFAULT_CURRENCY,
    hiddenAccounts: newHiddenAccounts,
  });

  return !currentHiddenAccounts.includes(address);
};
