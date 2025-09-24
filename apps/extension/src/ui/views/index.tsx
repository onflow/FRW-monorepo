import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToastProvider } from '@onflow/frw-context';
import { QueryProvider } from '@onflow/frw-screens';
import { extensionTamaguiConfig } from '@onflow/frw-ui';
import React, { useEffect } from 'react';
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
            </div>
          </QueryProvider>
        </ToastProvider>
      </TamaguiProvider>
    </ThemeProvider>
  );
};

export default App;
