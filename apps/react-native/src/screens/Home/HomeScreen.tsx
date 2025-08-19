import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, Text } from 'react-native';

import type { RootStackParamList } from '@/navigation/AppNavigator';
const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const { address, network } = route.params || {};

  useEffect(() => {
    console.log('🏠 HomeScreen mounted with params:', { address, network });
  }, [address, network]);

  return (
    <ScrollView>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
      <Text style={{ color: 'red' }}>HomeScreen</Text>
    </ScrollView>
  );
};

export default HomeScreen;
