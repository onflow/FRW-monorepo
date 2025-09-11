import { SendToScreen as BaseSendToScreen } from '@onflow/frw-screens';
import React from 'react';
import { Clipboard } from 'react-native';

// Override the global object to provide clipboard functionality
if (typeof global !== 'undefined') {
  (global as any).clipboard = {
    setString: (text: string) => {
      Clipboard.setString(text);
    },
  };
}

export function SendToScreen() {
  return <BaseSendToScreen />;
}
