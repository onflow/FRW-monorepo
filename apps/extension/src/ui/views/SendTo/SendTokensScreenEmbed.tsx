import { SendTokensScreen } from '@onflow/frw-screens';
import React from 'react';

import { useAppNavigation } from '@/ui/hooks/use-navigation';
import { useWallet } from '@/ui/hooks/use-wallet';


// Define the interface locally until the package is properly installed
interface BaseScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  bridge: {
    getSelectedAddress(): string | null;
    getNetwork(): string;
  };
  t: (key: string, options?: any) => string;
}

// Translation adapter: very minimal for now
function t(key: string): string {
  return key;
}

export default function SendTokensScreenEmbed() {
  const { navigate, goBack } = useAppNavigation();
  const wallet = useWallet();

  // Bridge adapter: map extension's wallet API to the minimal PlatformBridge used by screens
  const bridge = {
    getSelectedAddress(): string | null {
      // Handle async getCurrentAddress properly
      const address = wallet?.getCurrentAddress?.();
      if (address && typeof address === 'object' && 'then' in address) {
        // It's a Promise, return null for now (could be improved with async state)
        return null;
      }
      return (address as string) || null;
    },
    getNetwork(): string {
      const network = wallet?.getNetwork?.();
      if (network && typeof network === 'object' && 'then' in network) {
        // It's a Promise, return default for now
        return 'mainnet';
      }
      return (network as string) || 'mainnet';
    },
  };

  // Navigation adapter: use the new navigation system
  const navigation = {
    navigate,
    goBack,
  };

  // Handle transaction confirmation
  const handleConfirm = (transactionData: any) => {
    console.log('🚀 SendTokensScreen: Transaction confirmed:', transactionData);

    // Here you would typically:
    // 1. Execute the transaction
    // 2. Show confirmation/loading state
    // 3. Navigate to success/failure screen

    // For now, just log and potentially navigate back or to a confirmation screen
    // navigate('TransactionConfirmation', { transactionData });
  };

  const props: BaseScreenProps = { navigation, bridge, t };

  return (
    <SendTokensScreen
      {...props}
      token={null}
      recipientAddress=""
      recipientName=""
      onAmountChange={(amount: string) => console.log('Amount changed:', amount)}
      onConfirm={handleConfirm}
    />
  );
}
