import { WalletType } from '@onflow/frw-types';
import { cadenceService } from '@onflow/frw-workflow';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StatusBar, View } from 'react-native';

import type { RootStackParamList } from '@/navigation/AppNavigator';
import { Button, Card, Text } from 'ui';
const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();
  const { address, network } = route.params || {};

  useEffect(() => {
    const getAddr = async () => {
      const res = await cadenceService.getAddr('0x65002784202869ce');
      console.log('🏠 HomeScreen getAddr:', res);
    };
    getAddr();
  }, []);

  useEffect(() => {
    console.log('🏠 HomeScreen mounted with params:', { address, network });
  }, [address, network]);

  const sendTx = async () => {
    const res = await cadenceService.emptyTx('Johnson');
    console.log('🏠 HomeScreen emptyTx:', res);
  };

  return (
    <ScrollView className="flex-1 bg-base">
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />

      <View className="flex-1 justify-center items-center p-5 space-y-6">
        <Text size="3xl" weight="bold" className="text-fg-1 text-center mb-4">
          {t('home.title')}
        </Text>

        {/* Display props from iOS */}
        <View className="w-full space-y-3 flex flex-col gap-2 mb-4">
          <Card variant="elevated" className="bg-blue-50 border-blue-200 p-4">
            <View className="min-h-[30px] justify-center">
              <Text
                weight="medium"
                className="text-blue-800"
                numberOfLines={2}
                ellipsizeMode="middle"
              >
                {t('home.address')}: {address || t('home.notProvided')}
              </Text>
            </View>
          </Card>

          <Card variant="elevated" className="bg-purple-50 border-purple-200 p-4">
            <View className="min-h-[30px] justify-center">
              <Text
                weight="medium"
                className="text-purple-600"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t('home.network')}: {network || t('home.notProvided')}
              </Text>
            </View>
          </Card>
        </View>

        {/* Send To Actions */}
        <View className="w-full flex flex-col gap-2 py-2">
          <Text weight="semibold" size="lg" className="text-fg-1 mb-2">
            {t('home.sendToActions')}
          </Text>

          <Button size="lg" className="bg-warning" onPress={sendTx}>
            {t('home.sendTx')}
          </Button>

          <Button
            size="lg"
            className="bg-primary"
            onPress={() => navigation.navigate('SelectTokens')}
          >
            {t('home.send')}
          </Button>
        </View>

        {/* Navigation buttons */}
        <View className="w-full flex flex-col gap-2 py-2">
          <Text weight="semibold" size="lg" className="text-fg-1 mb-2">
            {t('home.navigation')}
          </Text>

          <Button
            size="lg"
            className="bg-success-15"
            onPress={() => navigation.navigate('ColorDemo')}
          >
            <Text className="text-fg-1 font-bold">{t('home.viewColors')}</Text>
          </Button>

          <Button
            size="lg"
            className="bg-purple-600"
            onPress={() =>
              navigation.navigate('NFTDetail', {
                nft: {
                  id: 'spring-tide-1',
                  name: 'Spring Tide #1',
                  description:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                  collectionName: 'NBA Top Shot',
                  contractName: 'TopShot',
                  contractAddress: '0x0b2a3299cc857e29',
                  thumbnail:
                    'https://via.placeholder.com/400x400/4ade80/ffffff?text=Spring+Tide+%231',
                  type: WalletType.Flow,
                },
                selectedNFTs: [
                  {
                    id: 'spring-tide-1',
                    name: 'Spring Tide #1',
                    collectionName: 'NBA Top Shot',
                    type: WalletType.Flow,
                  },
                  {
                    id: 'spring-tide-2',
                    name: 'Spring Tide #2',
                    collectionName: 'NBA Top Shot',
                    type: WalletType.Flow,
                  },
                  {
                    id: 'spring-tide-3',
                    name: 'Spring Tide #3',
                    collectionName: 'NBA Top Shot',
                    type: WalletType.Flow,
                  },
                  {
                    id: 'spring-tide-4',
                    name: 'Spring Tide #4',
                    collectionName: 'NBA Top Shot',
                    type: WalletType.Flow,
                  },
                ],
              })
            }
          >
            <Text className="text-white font-bold">View NFT Detail (Selectable)</Text>
          </Button>

          <Button
            size="lg"
            className="bg-green-600"
            onPress={() =>
              navigation.navigate('NFTDetail', {
                nft: {
                  id: 'spring-tide-view-only',
                  name: 'Spring Tide #1 (View Only)',
                  description: 'This NFT is for viewing only, not selectable.',
                  collectionName: 'NBA Top Shot',
                  contractName: 'TopShot',
                  contractAddress: '0x0b2a3299cc857e29',
                  thumbnail: 'https://via.placeholder.com/400x400/22c55e/ffffff?text=View+Only',
                  type: WalletType.Flow,
                },
                // selectedNFTs: undefined - selection disabled
              })
            }
          >
            <Text className="text-white font-bold">View NFT Detail (View Only)</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
