import { logger } from '@onflow/frw-context';
import { Button, ScrollView, Text, XStack } from '@onflow/frw-ui';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';

import type { RootStackParamList } from '@/navigation/AppNavigator';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const { address, network } = route.params || {};

  useEffect(() => {
    logger.debug('[HomeScreen] Mounted with params:', { address, network });
  }, [address, network]);

  return (
    <ScrollView>
      <Text style={{ color: 'red' }}>HomeScreen</Text>
      <XStack gap="$3" px="$4" pt="$4">
        <Button onPress={() => navigation.navigate('SelectTokens')}>
          <Text>Send</Text>
        </Button>
        <Button onPress={() => navigation.navigate('AddTokens')}>
          <Text>Add Tokens</Text>
        </Button>
      </XStack>
    </ScrollView>
  );
};

export default HomeScreen;
