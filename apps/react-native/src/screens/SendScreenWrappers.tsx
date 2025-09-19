import {
  SendTokensScreen as BaseSendTokensScreen,
  SendSingleNFTScreen as BaseSendSingleNFTScreen,
  SendMultipleNFTsScreen as BaseSendMultipleNFTsScreen,
  type ScreenAssets,
} from '@onflow/frw-screens';
import React from 'react';

// Import the static send image for React Native
const sendStaticImage = require('../assets/images/send_static.png');

// Create assets object
const screenAssets: ScreenAssets = {
  sendStaticImage,
};

// Wrapper components that pass the assets
export const SendTokensScreen = () => <BaseSendTokensScreen assets={screenAssets} />;
export const SendSingleNFTScreen = () => <BaseSendSingleNFTScreen assets={screenAssets} />;
export const SendMultipleNFTsScreen = () => <BaseSendMultipleNFTsScreen assets={screenAssets} />;