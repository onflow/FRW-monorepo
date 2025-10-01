import { getGlobalQueryClient, logger } from '@onflow/frw-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Platform } from 'react-native';
import { useSyncQueriesExternal } from 'react-query-external-sync';

// Development-only debugger component
const DevQueryDebugger: React.FC = () => {
  const queryClient = getGlobalQueryClient();

  useSyncQueriesExternal({
    queryClient,
    socketURL: 'http://localhost:42831',
    deviceName: `Flow Wallet RN (${Platform.OS})`,
    platform: Platform.OS,
    deviceId: Platform.OS,
    isDevice: true,
    enableLogs: true,
    // Add storage monitoring for debugging
    asyncStorage: AsyncStorage,
  });

  logger.info('[QueryDebugger] 🚀 React Query debugger setup completed');

  return null;
};

// Production-only empty component
const ProdQueryDebugger: React.FC = () => null;

/**
 * QueryDebugger component to set up TanStack Query debugging tools
 * Only enabled in development mode for security and performance
 */
export const QueryDebugger: React.FC = () => {
  const isEnabled = false;
  // Use different components for development and production
  if (typeof __DEV__ !== 'undefined' && __DEV__ && isEnabled) {
    return <DevQueryDebugger />;
  }

  return <ProdQueryDebugger />;
};
