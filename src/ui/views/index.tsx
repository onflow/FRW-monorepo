import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router';

import themeOptions from '@/ui/style/LLTheme';
import PrivateRoute from 'ui/components/PrivateRoute';
import { WalletProvider, useWallet } from 'ui/utils';

// Uncomment this when we need to test api-test
import ApiTestPage from './api-test/api-test-page';
import Approval from './Approval';
import InnerRoute from './InnerRoute';
import { Landing } from './Landing';
import SortHat from './SortHat';
import Unlock from './Unlock';

const theme = createTheme(themeOptions);

const AppRoutes = () => {
  const location = useLocation();
  const wallet = useWallet();

  React.useEffect(() => {
    wallet.trackPageView(location.pathname);
  }, [location, wallet]);

  return (
    <Routes>
      <Route path="/" element={<SortHat />} />
      <Route path="/unlock" element={<Unlock />} />
      <Route path="/welcome" element={<Landing />} />
      <Route path="/welcome/*" element={<Landing />} />
      <Route path="/forgot" element={<Landing />} />
      <Route path="/forgot/*" element={<Landing />} />
      <Route path="/dashboard/*" element={<InnerRoute />} />
      <Route
        path="/approval/*"
        element={
          <PrivateRoute>
            <Approval />
          </PrivateRoute>
        }
      />
      {/* uncomment this when we need to test api-test */}
      {process.env.NODE_ENV === 'development' && (
        <Route
          path="/api-test/*"
          element={
            <PrivateRoute>
              <ApiTestPage />
            </PrivateRoute>
          }
        />
      )}
    </Routes>
  );
};

function Main() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

const App = ({ wallet }: { wallet: any }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WalletProvider wallet={wallet}>
        <Main />
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;
