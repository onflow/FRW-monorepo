import { PortalProvider, TamaguiProvider, tamaguiConfig } from '@onflow/frw-ui';
import type { AppProps } from 'next/app';

import { initializeLogger } from '../utils/logger';
import '../styles/globals.css';

initializeLogger();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <PortalProvider>
        <Component {...pageProps} />
      </PortalProvider>
    </TamaguiProvider>
  );
}
