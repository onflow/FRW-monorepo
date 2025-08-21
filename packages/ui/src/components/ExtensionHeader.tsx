import { navigation } from '@onflow/frw-context';
import { ArrowBack, InfoIcon } from '@onflow/frw-icons';
import React from 'react';
import { View, XStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ExtensionHeaderProps {
  title: string | React.ReactNode;
  help: boolean | React.ReactNode;
  goBackLink?: string;
  right?: React.ReactNode;
}

export const ExtensionHeader: React.FC<ExtensionHeaderProps> = (props) => {
  const handleGoBack = () => {
    if (props.goBackLink) {
      navigation.navigate(props.goBackLink);
    } else {
      navigation.goBack();
    }
  };

  return (
    <XStack w="100%" h={48} items="center" justify="space-between" px="$4">
      {/* Left section - Back button (Grid size=1 equivalent) */}
      <View
        w={32}
        h={32}
        items="center"
        justify="center"
        onPress={handleGoBack}
        cursor="pointer"
        hoverStyle={{ opacity: 0.8 }}
        pressStyle={{ opacity: 0.6 }}
      >
        <ArrowBack size={20} color="#ffffff" />
      </View>

      <View flex={1} items="center" justify="center" px="$2">
        <Text fontSize={16} fontWeight="700" color="$white" textAlign="center" py="$3">
          {props.title}
        </Text>
      </View>

      <View w={32} h={32} items="center" justify="center">
        {props.right
          ? props.right
          : props.help && (
              <View
                w={32}
                h={32}
                items="center"
                justify="center"
                onPress={() => {
                  window.open('https://wallet.flow.com/contact', '_blank');
                }}
                cursor="pointer"
                hoverStyle={{ opacity: 0.8 }}
                pressStyle={{ opacity: 0.6 }}
              >
                <InfoIcon size={20} color="#ffffff" />
              </View>
            )}
      </View>
    </XStack>
  );
};
