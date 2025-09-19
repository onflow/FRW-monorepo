import { ServiceContext } from '@onflow/frw-context';
import { QueryProvider, initializeI18n } from '@onflow/frw-screens';
import { useWalletStore } from '@onflow/frw-stores';
import { TamaguiProvider, tamaguiConfig } from '@onflow/frw-ui';
import Instabug, { InvocationEvent } from 'instabug-reactnative';
import { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'react-native-get-random-values';
import { version } from '../package.json';
import { platform } from './bridge/PlatformImpl';
import { QueryDebugger } from './components/QueryDebugger';
import AppNavigator from './navigation/AppNavigator';

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
      console.debug('[App] Services initialized with RNBridge successfully');

      // Initialize i18n with platform-detected language
      const language = platform.getLanguage();
      await initializeI18n(language);
      console.debug('[App] i18n initialized with language:', language);

      // Initialize Instabug after ServiceContext is ready
      initializeInstabug(props);

      // Initialize walletStore when app starts to have account data ready
      await loadAccountsFromBridge();
    } catch (error) {
      console.error('[App] Failed to initialize app:', error);
    }
  }, [loadAccountsFromBridge, props]);

  const initializeInstabug = useCallback((appProps: AppProps) => {
    try {
      const instabugToken = platform.getInstabugToken();
      console.log('🚀 ~ initializeInstabug ~ instabugToken:', instabugToken);

      // Skip initialization if token is empty or invalid
      if (!instabugToken || instabugToken.trim() === '') {
        console.debug('[App] Instabug token not available, skipping initialization');
        return;
      }

      Instabug.init({
        token: instabugToken,
        invocationEvents: [InvocationEvent.none],
      });

      // Set user attributes for debugging
      Instabug.setUserAttribute('SelectedAccount', appProps.address ?? '');
      Instabug.setUserAttribute('Network', appProps.network ?? '');
      Instabug.setUserAttribute('Version', version);

      // Mark Instabug as initialized in platform
      platform.setInstabugInitialized(true);
      console.debug('[App] Instabug initialized with token');
    } catch (error) {
      console.error('[App] Failed to initialize Instabug:', error);
      // Don't mark as initialized if it failed
      platform.setInstabugInitialized(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <QueryProvider>
        <QueryDebugger />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppNavigator {...props} />
        </GestureHandlerRootView>
      </QueryProvider>
    </TamaguiProvider>
  );
};

export default App;
