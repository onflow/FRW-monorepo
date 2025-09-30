import { Close, FlowLogo, SurgeIcon } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, useTheme } from 'tamagui';

import { Text } from '../../foundation/Text';

export interface PriceBreakdownProps {
  isOpen: boolean;
  onClose: () => void;
  transactionFee?: string;
  surgeRate?: string;
  freeAllowance?: string;
  finalFee?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  isOpen,
  onClose,
  transactionFee = '5.00',
  surgeRate = '4X standard rate',
  freeAllowance = '1.1357',
  finalFee = '5.00',
}) => {
  const theme = useTheme();

  // Theme-aware colors
  const closeIconColor = theme.white?.val || '#FFFFFF';
  const activityIconColor = theme.black?.val || '#000000';
  const warningBackgroundColor = theme.warning?.val || '#FDB022';
  const modalBackgroundColor = theme.bg5?.val || '#2A2A2A';

  if (!isOpen) return null;

  return (
    <YStack
      bg="$dark80"
      items="center"
      justify="center"
      pressStyle={{ opacity: 1 }}
      onPress={onClose}
      aria-modal={true}
      role="dialog"
      aria-labelledby="price-breakdown-title"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      {/* Modal Content */}
      <YStack
        width={343}
        bg={modalBackgroundColor}
        rounded="$4"
        p="$4"
        gap="$4"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 5 }}
        shadowOpacity={0.25}
        shadowRadius={12}
        elevation={8}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <YStack
          pos="absolute"
          top={16}
          right={16}
          w={24}
          h={24}
          items="center"
          justify="center"
          bg="$dark5"
          rounded={12}
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          cursor="pointer"
          aria-label="Close dialog"
        >
          <Close size={10} color={closeIconColor} />
        </YStack>

        {/* Content Frame */}
        <YStack items="center" gap="$4" style={{ alignSelf: 'stretch', paddingTop: '$2' }}>
          {/* Icon */}
          <YStack
            items="center"
            justify="center"
            width={48}
            height={48}
            bg={warningBackgroundColor}
            rounded="$12"
          >
            <SurgeIcon size={26} color={activityIconColor} />
          </YStack>

          {/* Text Content */}
          <YStack items="center" gap="$2" style={{ alignSelf: 'stretch' }}>
            {/* Title */}
            <Text
              id="price-breakdown-title"
              fontSize="$6"
              fontWeight="700"
              color="#FFFFFF"
              lineHeight="$6"
              style={{ textAlign: 'center', width: 264 }}
            >
              Price breakdown
            </Text>
          </YStack>

          {/* Transaction Fee Card */}
          <YStack
            bg="rgba(255, 255, 255, 0.1)"
            borderRadius={16}
            p={0}
            px="$4.5"
            width="100%"
            items="center"
          >
            {/* Transaction Fee Row */}
            <XStack
              justify="space-between"
              items="center"
              alignSelf="stretch"
              p="$4"
              py="$4"
              borderBottomWidth={1}
              borderBottomColor="rgba(255, 255, 255, 0.1)"
            >
              <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight={20}>
                Transaction fee
              </Text>
              <XStack items="center" gap="$1.5">
                <Text
                  fontSize={14}
                  fontWeight="500"
                  color="rgba(255, 255, 255, 0.4)"
                  lineHeight={20}
                >
                  {transactionFee}
                </Text>
                <FlowLogo size={18} theme="multicolor" />
              </XStack>
            </XStack>

            {/* Surge Rate Row */}
            <XStack justify="space-between" items="center" alignSelf="stretch" p="$4" py="$4">
              <Text fontSize={14} fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight={20}>
                Surge rate
              </Text>
              <Text fontSize={14} fontWeight="500" color="rgba(255, 255, 255, 0.4)" lineHeight={20}>
                {surgeRate}
              </Text>
            </XStack>
          </YStack>

          {/* Free Transaction Allowance Card */}
          {/* <YStack background="$light10" borderRadius="$4" padding="$4" width="100%" gap="$4">
          {/* Free Transaction Allowance Row */}
          {/* <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize="$3" fontWeight="400" color="$light80">
              Free transaction allowance
            </Text>
            <XStack style={{ alignItems: 'center' }} gap="$1">
              <Text fontSize="$3" fontWeight="500" color="$light40">
                {freeAllowance}
              </Text>
              <FlowLogo size={18} theme="multicolor" />
            </XStack>
          </XStack>

          {/* Progress Bar */}
          {/* <YStack height={6} background="$light20" borderRadius="$2" width="100%" overflow="hidden">
            {/* Progress Fill - mostly filled */}
          {/* <YStack height="100%" width="76%" background="$warning" borderRadius="$2" />
          </YStack>

          {/* Warning Message */}
          {/* <Text fontSize="$3" fontWeight="400" color="$warning">
            Your free transaction allowance will not cover this transaction.
          </Text>
        </YStack> */}

          {/* Final Fee Payable Card */}
          {/* <YStack background="$light10" borderRadius="$4" padding="$4" width="100%">
          <XStack style={{ alignItems: 'center', justifyContent: 'space-between' }} width="100%">
            <Text fontSize="$3" fontWeight="400" color="$light80">
              Final fee payable
            </Text>
            <XStack style={{ alignItems: 'center' }} gap="$1">
              <Text fontSize="$3" fontWeight="500" color="$white">
                - {finalFee}
              </Text>
              {/* Flow icon placeholder */}
          {/* <YStack width={18} height={18} backgroundColor="$success" borderRadius="$2" />
            </XStack>
          </XStack>
        </YStack> */}

          {/* Description */}
          {/* <Text fontSize="$2" fontWeight="400" color="$white" lineHeight="$4">
          Transaction fee increased due to surge pricing in affect. Daily flow fee allocation was
          insufficient to pay the transaction fee, therefore you will be charged the full fee.
        </Text> */}

          {/* Button */}
          <YStack
            width="100%"
            height={52}
            bg="$white"
            rounded="$4"
            items="center"
            justify="center"
            pressStyle={{ opacity: 0.8 }}
            onPress={onClose}
            cursor="pointer"
            p="$4"
            shadowColor="$shadowColor"
            shadowOffset={{ width: 0, height: 1 }}
            shadowOpacity={1}
            shadowRadius={2}
            elevation={1}
          >
            <Text fontSize="$5" fontWeight="600" color="$black" style={{ textAlign: 'center' }}>
              Okay
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};
