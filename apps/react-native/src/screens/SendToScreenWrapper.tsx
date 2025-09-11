import { SendToScreen as BaseSendToScreen } from '@onflow/frw-screens';
import React from 'react';
import { Clipboard } from 'react-native';

console.log('=== SendToScreenWrapper loading ===');
console.log('React Native Clipboard available:', !!Clipboard);
console.log('Clipboard.setString available:', !!Clipboard?.setString);

// Override the global object to provide clipboard functionality
if (typeof global !== 'undefined') {
  console.log('Setting up global clipboard...');
  (global as any).clipboard = {
    setString: (text: string) => {
      console.log('Global clipboard.setString called with:', text);
      Clipboard.setString(text);
      console.log('React Native Clipboard.setString completed');
    },
  };
  console.log('Global clipboard setup complete');
  console.log('Test global.clipboard:', (global as any).clipboard);
} else {
  console.warn('Global object not available');
}

export function SendToScreen() {
  console.log('SendToScreen wrapper rendering');
  return <BaseSendToScreen />;
}
