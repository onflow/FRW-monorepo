import { SelectTokensScreen } from '@onflow/frw-screens';
import { useSendStore } from '@onflow/frw-stores';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import {
  usePlatformBridge,
  usePlatformNavigation,
  usePlatformTranslation,
} from '@/bridge/PlatformContext';

const SelectTokensScreenView = () => {
  const navigate = useNavigate();
  const { selectedToken } = useSendStore();
  const { t } = useTranslation();

  // Use platform services
  const platformBridge = usePlatformBridge();
  const platformNavigation = usePlatformNavigation(navigate);
  const platformTranslation = usePlatformTranslation();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: '100%',
      }}
    >
      <SelectTokensScreen />
    </div>
  );
};

export default SelectTokensScreenView;
