import { ServiceContext } from '@onflow/frw-context';
import { useWalletStore } from '@onflow/frw-stores';
import { logger } from '@onflow/frw-utils';
import { useCallback, useEffect } from 'react';
import { Platform, Text as RNText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'react-native-get-random-values';
import { platform } from './bridge/PlatformImpl';
import { ConfirmationDrawerProvider } from './contexts/ConfirmationDrawerContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './global.css';
import { getGlobalTextProps } from './lib/androidTextFix';
import './lib/i18n';
import AppNavigator from './navigation/AppNavigator';

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
  // Initialize walletStore when the app starts
  const { loadAccountsFromBridge } = useWalletStore();

  const initializeApp = useCallback(async () => {
    try {
      // Initialize services with RNBridge dependency injection
      ServiceContext.initialize(platform);
      logger.debug('[App] Services initialized with RNBridge successfully');

      // Initialize walletStore when app starts to have account data ready
      await loadAccountsFromBridge();
      logger.debug('[App] Wallet store initialized successfully');
    } catch (error) {
      logger.error('[App] Failed to initialize app:', error);
    }
  }, [loadAccountsFromBridge]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ConfirmationDrawerProvider>
          <AppNavigator {...props} />
        </ConfirmationDrawerProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
};

export default App;
