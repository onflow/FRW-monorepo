import { SendToScreen } from '@onflow/frw-screens';
import React from 'react';
import { useNavigate } from 'react-router';

import {
  usePlatformNavigation,
  usePlatformBridge,
  usePlatformTranslation,
} from '@/bridge/PlatformContext';

const SendToNewView = () => {
  const navigate = useNavigate();

  // Get platform services
  const navigation = usePlatformNavigation(navigate);
  const bridge = usePlatformBridge();
  const t = usePlatformTranslation();

  return <SendToScreen navigation={navigation} bridge={bridge} t={t} />;
};

export default SendToNewView;
