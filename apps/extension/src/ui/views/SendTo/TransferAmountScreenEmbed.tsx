import { SendToAmountScreen } from '@onflow/frw-screens';
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

export default function TransferAmountScreenEmbed() {
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

  // Handle amount change
  const handleAmountChange = (amount: string) => {
    console.log('💰 TransferAmountScreen: Amount changed:', amount);
    // You could update a store or state here
  };

  // Handle continue with amount
  const handleContinue = (amount: string) => {
    console.log('💰 TransferAmountScreen: Continue with amount:', amount);

    // Navigate to the next step (confirmation)
    navigate('TransferConfirmation', { amount });
  };

  const props: BaseScreenProps = { navigation, bridge, t };

  return (
    <SendToAmountScreen
      {...props}
      transactionState={null}
      onAmountChange={handleAmountChange}
      onContinue={handleContinue}
    />
  );
}
