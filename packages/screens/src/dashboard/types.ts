import { type ReactNode } from 'react';

export interface DashboardProps {
  // Navigation handlers
  onSendClick?: () => void;
  onReceiveClick?: () => void;
  onSwapClick?: () => void;
  onBuyClick?: () => void;
  onMoveClick?: () => void;

  // Data
  network?: string;
  balance?: string;
  currencyCode?: string;
  currencySymbol?: string;
  noAddress?: boolean;
  addressCreationInProgress?: boolean;
  canMoveToOtherAccount?: boolean;
  activeAccountType?: 'main' | 'evm' | 'child';

  // UI customization
  showBuildIndicator?: boolean;
  showNetworkIndicator?: boolean;
  emulatorModeOn?: boolean;

  // Custom components
  customButtonRow?: ReactNode;
  customWalletTab?: ReactNode;
}

export interface DashboardTotalProps {
  network?: string;
  balance?: string;
  currencyCode?: string;
  currencySymbol?: string;
  noAddress?: boolean;
  addressCreationInProgress?: boolean;
  onAddAddress?: () => void;
}

export interface WalletTabProps {
  network?: string;
  activeAccountType?: 'main' | 'evm' | 'child';
  currentWallet?: {
    address: string;
    name?: string;
  };
  parentWallet?: {
    address: string;
    name?: string;
  };

  // Tab content components
  tokensComponent?: ReactNode;
  nftsComponent?: ReactNode;
  activityComponent?: ReactNode;

  // Customization
  showActivityTab?: boolean;
  initialTab?: number;
}
