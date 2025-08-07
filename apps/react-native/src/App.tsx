import { configureFCL } from '@onflow/frw-cadence';
import { useWalletStore } from '@onflow/frw-stores';
import { useEffect } from 'react';
import { Platform, Text as RNText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConfirmationDrawerProvider } from './contexts/ConfirmationDrawerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './global.css';
import { getGlobalTextProps } from './lib/androidTextFix';
import AppNavigator from './navigation/AppNavigator';
import './lib/i18n';

// Configure default text props for Android to prevent text cutoff issues
if (Platform.OS === 'android') {
  const defaultTextProps = (RNText as any).defaultProps || {};
  (RNText as any).defaultProps = {
    ...defaultTextProps,
    ...getGlobalTextProps(),
  };
}
interface AppProps {
  address?: string;
  network?: string;
  initialRoute?: string;
  embedded?: boolean;
}

const App = (props: AppProps) => {
  configureFCL(props.network as 'mainnet' | 'testnet');

  // Initialize walletStore when the app starts
  const { loadAccountsFromBridge } = useWalletStore();

  useEffect(() => {
    // Initialize walletStore when app starts to have account data ready
    loadAccountsFromBridge();
  }, [loadAccountsFromBridge]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <ConfirmationDrawerProvider>
            <AppNavigator {...props} />
          </ConfirmationDrawerProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;
