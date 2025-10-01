import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToastProvider } from '@onflow/frw-context';
import { QueryProvider } from '@onflow/frw-screens';
import { extensionTamaguiConfig, SurgeModal } from '@onflow/frw-ui';
import React, { useEffect, useState } from 'react';
import { Route, HashRouter as Router, Routes, useLocation } from 'react-router';
import { TamaguiProvider } from 'tamagui';

// Import Tamagui CSS for web support
import '@tamagui/font-inter/css/400.css';
import '@tamagui/font-inter/css/700.css';

import { PlatformProvider } from '@/bridge/PlatformContext';
import PrivateRoute from '@/ui/components/PrivateRoute';
import { useWallet, useWalletLoaded } from '@/ui/hooks/use-wallet';
import themeOptions from '@/ui/style/LLTheme';
import { WalletProvider } from '@/ui/utils/WalletContext';

// Uncomment this when we need to test api-test
import Approval from './Approval';
import Forgot from './Forgot';
import Recover from './Forgot/Recover';
import Reset from './Forgot/Reset';
import InnerRoute from './InnerRoute';
import SortHat from './SortHat';
import Unlock from './Unlock';
import Welcome from './Welcome';
import ImportProfile from './Welcome/import-profile';
import Register from './Welcome/Register';
import Sync from './Welcome/Sync';

const theme = createTheme(themeOptions);

const AppRoutes = () => {
  const location = useLocation();
  const wallet = useWallet();
  const loaded = useWalletLoaded();

  useEffect(() => {
    if (loaded) {
      wallet.trackPageView(location.pathname);
    }
  }, [location, wallet, loaded]);

  return (
    <Routes>
      <Route path="/" element={<SortHat />} />
      <Route path="/unlock" element={<Unlock />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/welcome/register" element={<Register />} />
      <Route path="/welcome/importprofile" element={<ImportProfile />} />
      <Route path="/welcome/sync" element={<Sync />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/forgot/recover" element={<Recover />} />
      <Route path="/forgot/reset" element={<Reset />} />
      <Route path="/dashboard/*" element={<InnerRoute />} />
      <Route
        path="/approval/*"
        element={
          <PrivateRoute>
            <Approval />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

function Main() {
  return (
    <Router>
      <PlatformProvider>
        <AppRoutes />
      </PlatformProvider>
    </Router>
  );
}

const App = ({ wallet }: { wallet: any }) => {
  const [isSurgeModalVisible, setIsSurgeModalVisible] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  // Global surge modal for 429 errors
  useEffect(() => {
    const handleApiRateLimit = (message: any) => {
      console.log('API_RATE_LIMIT message received:', message);
      if (message.type === 'API_RATE_LIMIT' && message.data?.status === 429) {
        console.log('API rate limit detected, showing global surge modal:', message.data);
        setIsSurgeModalVisible(true);
        setHasResponded(false); // Reset response flag when showing modal
      } else {
        console.log('Message is not API_RATE_LIMIT or status is not 429:', message);
      }
    };

    // Add Chrome extension message listener
    chrome.runtime.onMessage.addListener(handleApiRateLimit);

    // Cleanup message listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleApiRateLimit);
    };
  }, []);

  const handleSurgeModalClose = () => {
    if (hasResponded) return; // Prevent multiple responses

    console.log('SurgeModal onClose called');
    setIsSurgeModalVisible(false);
    setHasResponded(true);

    // Send rejection response
    chrome.runtime.sendMessage({
      type: 'SURGE_APPROVAL_RESPONSE',
      data: { approved: false },
    });
  };

  const handleSurgeModalAgree = () => {
    if (hasResponded) {
      console.log('SurgeModal onAgree called but already responded, ignoring');
      return; // Prevent multiple responses
    }

    console.log('SurgeModal onAgree called - sending approval response');
    setIsSurgeModalVisible(false);
    setHasResponded(true);

    // Send approval response
    chrome.runtime.sendMessage({
      type: 'SURGE_APPROVAL_RESPONSE',
      data: { approved: true },
    });
    console.log('Surge approval response sent');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TamaguiProvider config={extensionTamaguiConfig} defaultTheme="dark">
        <ToastProvider>
          <QueryProvider>
            <div className="t_dark" style={{ minHeight: '100vh' }}>
              <WalletProvider wallet={wallet}>
                <Main />
              </WalletProvider>

              {console.log('Rendering SurgeModal with visible:', isSurgeModalVisible)}
              <SurgeModal
                visible={isSurgeModalVisible}
                onClose={handleSurgeModalClose}
                onAgree={handleSurgeModalAgree}
                isLoading={false}
              />
            </div>
          </QueryProvider>
        </ToastProvider>
      </TamaguiProvider>
    </ThemeProvider>
  );
};

export default App;
