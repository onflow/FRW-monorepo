import { ServiceContext } from '@onflow/frw-context';
import { QueryProvider, initializeI18n } from '@onflow/frw-screens';
import { useWalletStore } from '@onflow/frw-stores';
import { TamaguiProvider, tamaguiConfig } from '@onflow/frw-ui';
import Instabug, { InvocationEvent } from 'instabug-reactnative';
import { useCallback, useEffect } from 'react';
import { ErrorUtils, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import 'react-native-get-random-values';
import { version } from '../package.json';
import { platform } from './bridge/PlatformImpl';
import { FRWErrorBoundary } from './components/ErrorBoundary';
import { QueryDebugger } from './components/QueryDebugger';
import AppNavigator from './navigation/AppNavigator';
import { handleGlobalError, handleUnhandledRejection } from './utils/errorHandling';

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

  const setupGlobalErrorHandlers = useCallback(() => {
    // Global JavaScript exception handler
    const originalHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      // Handle and log the error
      handleGlobalError(error, isFatal ?? false);

      // Call original handler to maintain system behavior
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    // Unhandled Promise Rejection handler using React Native's tracking API
    // This is available in React Native without additional dependencies
    const tracking = require('promise/setimmediate/rejection-tracking');
    if (tracking && typeof tracking.enable === 'function') {
      tracking.enable({
        allRejections: true,
        onUnhandled: (id: string, error: Error) => {
          handleUnhandledRejection(error, Promise.resolve());
        },
        onHandled: (id: string) => {
          platform.log('info', '[App] Promise rejection handled:', id);
        },
      });
    } else {
      // Fallback: Set up a global unhandled rejection handler
      if (
        typeof (global as unknown as { HermesInternal?: unknown }).HermesInternal !== 'undefined'
      ) {
        // Running on Hermes engine - use alternative approach
        platform.log(
          'debug',
          '[App] Running on Hermes - using alternative promise rejection tracking'
        );
      }

      // Add event listener for unhandled rejections (standard approach)
      if (typeof global.addEventListener === 'function') {
        global.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
          const error =
            event.reason instanceof Error ? event.reason : new Error(String(event.reason));
          handleUnhandledRejection(error, event.promise || Promise.resolve());
          event.preventDefault();
        });
      }
    }

    platform.log('debug', '[App] Global error handlers initialized');
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      if (!ServiceContext.isInitialized()) {
        ServiceContext.initialize(platform);
      }
      platform.log('debug', '[App] Services initialized with RNBridge successfully (effect)');

      // Setup global error handlers
      setupGlobalErrorHandlers();

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
  }, [loadAccountsFromBridge, props, setupGlobalErrorHandlers]);

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
    <FRWErrorBoundary>
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
    </FRWErrorBoundary>
  );
};

export default App;
