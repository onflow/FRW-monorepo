import { getGlobalQueryClient, setGlobalQueryClient } from '@onflow/frw-context';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { createContext, useContext, useMemo } from 'react';

// Create a context for sharing QueryClient instance
const QueryClientContext = createContext<QueryClient | null>(null);

// Hook to access the shared QueryClient
export const useQueryClient = (): QueryClient => {
  const client = useContext(QueryClientContext);
  if (!client) {
    throw new Error('useQueryClient must be used within a QueryProvider');
  }
  return client;
};

interface QueryProviderProps {
  children: React.ReactNode;
  queryClient?: QueryClient; // Allow passing custom QueryClient for testing
}

// FRW-specific QueryClient creation is now handled by context package

export const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
  queryClient: externalQueryClient,
}) => {
  // Use the global QueryClient instance from context package
  const queryClient = useMemo(() => {
    if (externalQueryClient) {
      setGlobalQueryClient(externalQueryClient);
      return externalQueryClient;
    }
    return getGlobalQueryClient();
  }, [externalQueryClient]);

  return (
    <QueryClientContext.Provider value={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </QueryClientContext.Provider>
  );
};

// Global QueryClient management is now handled by @onflow/frw-context package
