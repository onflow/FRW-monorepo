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
import { getSurgeData } from '@/bridge/PlatformImpl';
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
  const [surgeData, setSurgeData] = useState<{ maxFee?: string; multiplier?: number } | null>(null);

  // Global surge modal for 429 errors and surge pricing
  useEffect(() => {
    const handleMessage = async (message: any) => {
      if (message.type === 'API_RATE_LIMIT' && message.data?.status === 429) {
        console.log('UI: API rate limit detected, showing global surge modal:', message.data);
        // Store surge data if available
        if (message.data?.surgeData) {
          setSurgeData(message.data.surgeData);
        } else {
          // Fetch surge data using the exported function
          try {
            const surgeData = await getSurgeData('mainnet');
            setSurgeData(surgeData);
          } catch (error) {
            console.log('Error fetching surge data:', error);
            setSurgeData(null);
          }
        }
        setIsSurgeModalVisible(true);
        setHasResponded(false); // Reset response flag when showing modal
      } else if (message.type === 'CLOSE_APPROVAL_POPUP') {
        // Close the approval popup window
        if (window.close) {
          window.close();
        } else {
          chrome.runtime.sendMessage({ type: 'CLOSE_POPUP' });
        }
      }
    };

    // Add Chrome extension message listener
    chrome.runtime.onMessage.addListener(handleMessage);

    // Cleanup message listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleSurgeModalClose = () => {
    if (hasResponded) return; // Prevent multiple responses

    console.log('SurgeModal onClose called');
    setIsSurgeModalVisible(false);
    setHasResponded(true);

    // Set surge approval to false (user rejected)
    chrome.runtime.sendMessage({
      type: 'controller',
      method: 'setSurgeApproval',
      params: [false],
    });

    // Send rejection response
    chrome.runtime.sendMessage({
      type: 'SURGE_APPROVAL_RESPONSE',
      data: { approved: false },
    });
    setHasResponded(false);
  };

  const handleSurgeModalAgree = () => {
    if (hasResponded) {
      console.log('SurgeModal onAgree called but already responded, ignoring');
      return; // Prevent multiple responses
    }

    console.log('SurgeModal onAgree called - sending approval response');
    setIsSurgeModalVisible(false);
    setHasResponded(true);

    // Set surge approval to true (user approved)
    chrome.runtime.sendMessage({
      type: 'controller',
      method: 'setSurgeApproval',
      params: [true],
    });

    // Send approval response
    chrome.runtime.sendMessage({
      type: 'SURGE_APPROVAL_RESPONSE',
      data: { approved: true },
    });
    setHasResponded(false);
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

              <SurgeModal
                visible={isSurgeModalVisible}
                transactionFee={surgeData?.maxFee || '- 500.00'}
                multiplier={surgeData?.multiplier?.toString() || '4'}
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
