import { Button, ScrollView, Text } from '@onflow/frw-ui';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';

import type { RootStackParamList } from '@/navigation/AppNavigator';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const { address, network } = route.params || {};

  useEffect(() => {
    console.log('🏠 HomeScreen mounted with params:', { address, network });
  }, [address, network]);

  return (
    <ScrollView>
      <Text style={{ color: 'red' }}>HomeScreen</Text>
      <Button onPress={() => navigation.navigate('SelectTokens')}>
        <Text>Send</Text>
      </Button>
      <Button onPress={() => navigation.navigate('GetStarted')} style={{ marginTop: 10 }}>
        <Text>Test Onboarding</Text>
      </Button>
    </ScrollView>
  );
};

export default HomeScreen;
