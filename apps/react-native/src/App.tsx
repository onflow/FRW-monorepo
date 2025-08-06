import { ServiceContext } from '@onflow/frw-context';
import { useWalletStore } from '@onflow/frw-stores';
import Instabug, { InvocationEvent } from 'instabug-reactnative';
import { useEffect } from 'react';
import { Platform, Text as RNText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { version } from '@/../package.json';

import NativeFRWBridge from './bridge/NativeFRWBridge';
import 'react-native-get-random-values';
import { bridge } from './bridge/RNBridge';
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

const initializeInstabug = (props: AppProps) => {
  const envKeys = NativeFRWBridge.getEnvKeys();
  Instabug.init({
    token: envKeys.INSTABUG_TOKEN,
    invocationEvents: [InvocationEvent.none],
  });

  // Set user attributes for debugging
  Instabug.setUserAttribute('SelectedAccount', props.address ?? '');
  Instabug.setUserAttribute('Network', props.network ?? '');
  Instabug.setUserAttribute('Version', version);
};

const App = (props: AppProps) => {
  // Initialize walletStore when the app starts
  const { loadAccountsFromBridge } = useWalletStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize services with RNBridge dependency injection
        ServiceContext.initialize(bridge);
        console.log('[App] Services initialized with RNBridge successfully');

        // Initialize walletStore when app starts to have account data ready
        await loadAccountsFromBridge();
        initializeInstabug(props);

        console.log('[App] Wallet store initialized successfully');
      } catch (error) {
        console.error('[App] Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, []); // Remove loadAccountsFromBridge dependency to prevent re-initialization

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
