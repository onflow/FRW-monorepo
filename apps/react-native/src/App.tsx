import { ServiceContext } from '@onflow/frw-context';
import { useWalletStore } from '@onflow/frw-stores';
import { logger } from '@onflow/frw-utils';
import Instabug, { InvocationEvent } from 'instabug-reactnative';
import { useCallback, useEffect } from 'react';
import { Platform, Text as RNText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import 'react-native-get-random-values';
import { version } from '../package.json';
import { platform } from './bridge/PlatformImpl';
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
  // Initialize walletStore when the app starts
  const { loadAccountsFromBridge } = useWalletStore();

  const initializeApp = useCallback(async () => {
    try {
      // Initialize services with RNBridge dependency injection
      ServiceContext.initialize(platform);
      logger.debug('[App] Services initialized with RNBridge successfully');

      // Initialize Instabug after ServiceContext is ready
      initializeInstabug(props);
      logger.debug('[App] Instabug initialized successfully');

      // Initialize walletStore when app starts to have account data ready
      await loadAccountsFromBridge();
      logger.debug('[App] Wallet store initialized successfully');
    } catch (error) {
      logger.error('[App] Failed to initialize app:', error);
    }
  }, [loadAccountsFromBridge, props]);

  const initializeInstabug = useCallback((appProps: AppProps) => {
    try {
      Instabug.init({
        token: platform.getInstabugToken(),
        invocationEvents: [InvocationEvent.none],
      });

      // Set user attributes for debugging
      Instabug.setUserAttribute('SelectedAccount', appProps.address ?? '');
      Instabug.setUserAttribute('Network', appProps.network ?? '');
      Instabug.setUserAttribute('Version', version);
    } catch (error) {
      logger.error('[App] Failed to initialize Instabug:', error);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

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
