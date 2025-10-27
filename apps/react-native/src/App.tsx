import { ServiceContext } from '@onflow/frw-context';
import { QueryProvider, initializeI18n } from '@onflow/frw-screens';
import { useWalletStore } from '@onflow/frw-stores';
import { PortalProvider, TamaguiProvider, tamaguiConfig } from '@onflow/frw-ui';
import Instabug, { InvocationEvent } from 'instabug-reactnative';
import { useCallback, useEffect } from 'react';
import { Clipboard, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'react-native-get-random-values';
import { version } from '../package.json';
import { platform } from './bridge/PlatformImpl';
import { QueryDebugger } from './components/QueryDebugger';
import AppNavigator from './navigation/AppNavigator';

// Set up global clipboard for React Native (used by screens that need clipboard access)
(globalThis as any).clipboard = {
  setString: (text: string) => {
    Clipboard.setString(text);
  },
};

interface AppProps {
  address?: string;
  network?: string;
  initialRoute?: string;
  embedded?: boolean;
}

const App = (props: AppProps) => {
  // Initialize walletStore when the app starts
  const { loadAccountsFromBridge } = useWalletStore();

  // Ensure ServiceContext is initialized BEFORE any children render that access `bridge`
  if (!ServiceContext.isInitialized()) {
    ServiceContext.initialize(platform);
    platform.log('debug', '[App] Services initialized with RNBridge (sync)');
  }

  const initializeApp = useCallback(async () => {
    try {
      if (!ServiceContext.isInitialized()) {
        ServiceContext.initialize(platform);
      }
      platform.log('debug', '[App] Services initialized with RNBridge successfully (effect)');

      // Initialize i18n with platform-detected language
      const language = platform.getLanguage();
      await initializeI18n(language);
      platform.log('debug', '[App] i18n initialized with language:', language);

      // Initialize Instabug after ServiceContext is ready
      initializeInstabug(props);

      // Initialize walletStore when app starts to have account data ready
      await loadAccountsFromBridge();
    } catch (error) {
      platform.log('error', '[App] Failed to initialize app:', error);
    }
  }, [loadAccountsFromBridge, props]);

  const initializeInstabug = useCallback((appProps: AppProps) => {
    try {
      const instabugToken = platform.getInstabugToken();

      // Skip initialization if token is empty or invalid
      if (!instabugToken || instabugToken.trim() === '') {
        platform.log('debug', '[App] Instabug token not available, skipping initialization');
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
      platform.log('debug', '[App] Instabug initialized with token');
    } catch (error) {
      platform.log('error', '[App] Failed to initialize Instabug:', error);
      // Don't mark as initialized if it failed
      platform.setInstabugInitialized(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  const colorScheme = useColorScheme();

  return (
    <PortalProvider shouldAddRootHost>
      <TamaguiProvider
        config={tamaguiConfig}
        defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}
      >
        <QueryProvider>
          <QueryDebugger />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigator {...props} />
          </GestureHandlerRootView>
        </QueryProvider>
      </TamaguiProvider>
    </PortalProvider>
  );
};

export default App;
