import {
  SendTokensScreen as BaseSendTokensScreen,
  SendSummaryScreen as BaseSendSummaryScreen,
  type ScreenAssets,
} from '@onflow/frw-screens';
import React from 'react';

// Import the static send image from centralized UI package
const sendStaticImage = require('@onflow/frw-ui/src/assets/send_static.png');

// Create assets object
const screenAssets: ScreenAssets = {
  sendStaticImage,
};

// Wrapper components that pass the assets
export const SendTokensScreen = () => <BaseSendTokensScreen assets={screenAssets} />;
export const SendSummaryScreen = () => <BaseSendSummaryScreen assets={screenAssets} />;
