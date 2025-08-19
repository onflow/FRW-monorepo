import { YStack, XStack, ScrollView, Text, BackgroundWrapper } from '@onflow/frw-ui';
import React, { useState } from 'react';

import { ButtonRow } from './ButtonRow';
import { DashboardTotal } from './DashboardTotal';
import { type DashboardProps } from './types';
import { WalletTab } from './WalletTab';

export const Dashboard: React.FC<DashboardProps> = ({
  // Navigation handlers
  onSendClick,
  onReceiveClick,
  onSwapClick,
  onBuyClick,
  onMoveClick,

  // Data
  network,
  balance,
  currencyCode,
  currencySymbol,
  noAddress,
  addressCreationInProgress,
  canMoveToOtherAccount,
  activeAccountType = 'main',

  // UI customization
  showBuildIndicator = false,
  showNetworkIndicator = true,
  emulatorModeOn = false,

  // Custom components
  customButtonRow,
  customWalletTab,
}) => {
  const [showOnRamp, setShowOnRamp] = useState(false);
  const [showMoveBoard, setShowMoveBoard] = useState(false);

  const handleAddAddress = () => {
    // This should be implemented by the consuming application
    console.log('Add address clicked - implement in consuming app');
  };

  return (
    <BackgroundWrapper backgroundColor="#0F0F0F">
      <YStack style={{ flex: 1, width: '100%' }}>
        {/* Build Indicator */}
        {showBuildIndicator && (
          <XStack style={{ width: '100%', justifyContent: 'flex-end', padding: 8 }}>
            <Text fontSize="$2" color="#777E90">
              Development Build
            </Text>
          </XStack>
        )}

        {/* Network Indicator */}
        {showNetworkIndicator && (network === 'testnet' || emulatorModeOn) && (
          <XStack style={{ width: '100%', justifyContent: 'center', paddingBottom: 8 }}>
            <YStack
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 13,
                backgroundColor: emulatorModeOn ? '#ff4c0029' : '#FF8A0029',
              }}
            >
              <Text
                fontSize="$3"
                fontWeight="500"
                color={emulatorModeOn ? '#ff3d00' : '#FF8A00'}
                style={{ textAlign: 'center' }}
              >
                {emulatorModeOn
                  ? network === 'testnet'
                    ? 'Emulate Testnet'
                    : 'Emulate Mainnet'
                  : network === 'testnet'
                    ? 'Testnet'
                    : 'Mainnet'}
              </Text>
            </YStack>
          </XStack>
        )}

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Dashboard Total */}
          <DashboardTotal
            network={network}
            balance={balance}
            currencyCode={currencyCode}
            currencySymbol={currencySymbol}
            noAddress={noAddress}
            addressCreationInProgress={addressCreationInProgress}
            onAddAddress={handleAddAddress}
          />

          {/* Button Row */}
          {customButtonRow || (
            <ButtonRow
              onSendClick={onSendClick}
              onReceiveClick={onReceiveClick}
              onSwapClick={onSwapClick}
              onBuyClick={() => {
                if (onBuyClick) {
                  onBuyClick();
                } else {
                  setShowOnRamp(true);
                }
              }}
              onMoveClick={() => {
                if (onMoveClick) {
                  onMoveClick();
                } else {
                  setShowMoveBoard(true);
                }
              }}
              canMoveChild={canMoveToOtherAccount}
            />
          )}

          {/* Wallet Tab */}
          {customWalletTab || <WalletTab network={network} activeAccountType={activeAccountType} />}
        </ScrollView>

        {/* OnRamp Modal/Drawer - placeholder */}
        {showOnRamp && (
          <YStack
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              justifyContent: 'flex-end',
            }}
            onPress={() => setShowOnRamp(false)}
          >
            <YStack
              style={{
                backgroundColor: '#1A1A1A',
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                padding: 20,
                minHeight: '65%',
              }}
            >
              <Text color="white" fontSize="$6" fontWeight="600" style={{ marginBottom: 16 }}>
                Buy Crypto
              </Text>
              <Text color="#777E90" fontSize="$4">
                OnRamp integration would go here
              </Text>
            </YStack>
          </YStack>
        )}

        {/* Move Board Modal - placeholder */}
        {showMoveBoard && (
          <YStack
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => setShowMoveBoard(false)}
          >
            <YStack
              style={{
                backgroundColor: '#1A1A1A',
                borderRadius: 12,
                padding: 20,
                margin: 20,
                minWidth: '80%',
              }}
            >
              <Text color="white" fontSize="$6" fontWeight="600" style={{ marginBottom: 16 }}>
                Move Assets
              </Text>
              <Text color="#777E90" fontSize="$4">
                Move board functionality would go here
              </Text>
            </YStack>
          </YStack>
        )}
      </YStack>
    </BackgroundWrapper>
  );
};
