import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ToastProvider, type ToastRenderer } from '@onflow/frw-context';
import { QueryProvider } from '@onflow/frw-screens';
import { extensionTamaguiConfig, PortalProvider, Toast } from '@onflow/frw-ui';
import * as Sentry from '@sentry/react';
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
  const feedbackCallback = async () => {
    try {
      const feedback = Sentry.getFeedback();
      const form = await feedback?.createForm();
      form!.appendToDom();

      form!.open();
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const renderToast: ToastRenderer = (toast, { hide }) => (
    <Toast
      key={toast.id}
      title={toast.title}
      visible={toast.visible}
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={() => hide(toast.id)}
      feedbackCallback={feedbackCallback}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PortalProvider shouldAddRootHost>
        <TamaguiProvider config={extensionTamaguiConfig} defaultTheme="dark">
          <ToastProvider renderToast={renderToast}>
            <QueryProvider>
              <div className="t_dark" style={{ minHeight: '100vh' }}>
                <WalletProvider wallet={wallet}>
                  <Main />
                </WalletProvider>
              </div>
            </QueryProvider>
          </ToastProvider>
        </TamaguiProvider>
      </PortalProvider>
    </ThemeProvider>
  );
};

export default App;
