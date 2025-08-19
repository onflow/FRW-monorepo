import { useSendStore } from '@onflow/frw-stores';
import { type NFTModel } from '@onflow/frw-types';
import { getNFTCover, getNFTId } from '@onflow/frw-utils';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconView } from '@/components/ui/media/IconView';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronDown, Trash as TrashIcon } from 'icons';
interface BottomConfirmBarProps {
  selectedNFTs: NFTModel[];
  onRemoveNFT?: (nftId: string) => void;
  onExpandedChange?: (isExpanded: boolean) => void;
  isEditing?: boolean;
}

const COLLAPSED_HEIGHT = 120;
const HEADER_HEIGHT = 48; // Height of the title/chevron area
const NFT_ITEM_HEIGHT = 69; // Height of each NFT item (53px image + 16px padding)
const BUTTON_AREA_HEIGHT = 104; // Height of the confirm button area (88 + 16 top padding)
const MAX_EXPANDED_HEIGHT = 500; // Maximum height to prevent taking up too much screen
const MIN_EXPANDED_HEIGHT = 200; // Minimum expanded height
const SCREEN_WIDTH = Dimensions.get('window').width;

// NFT List Item Component
function NFTListItem({
  nft,
  index,
  total,
  onRemove,
  isDark,
}: {
  nft: NFTModel;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  isDark: boolean;
}) {
  return (
    <View key={getNFTId(nft)}>
      <View className="flex-row justify-between items-center py-3">
        <View className="flex-row items-center gap-2">
          <IconView
            src={getNFTCover(nft)}
            size={54}
            borderRadius={16}
            resizeMode="cover"
            backgroundColor="transparent"
          />
          <View style={{ gap: 6 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Inter',
                fontWeight: '600',
                fontSize: 14,
                lineHeight: 20, // 1.4285714285714286em * 14px ≈ 20px
                letterSpacing: -0.084, // -0.6% of 14px
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {nft.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: 'Inter',
                fontWeight: '400',
                fontSize: 14,
                lineHeight: 20, // 1.4285714285714286em * 14px ≈ 20px
                letterSpacing: -0.084, // -0.6% of 14px
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              {nft.collectionName}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onRemove(getNFTId(nft))}
          style={{
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.7}
        >
          <TrashIcon width={24} height={24} color="rgba(255, 255, 255, 0.5)" />
        </TouchableOpacity>
      </View>
      {/* Divider */}
      {index < total - 1 && (
        <View
          style={{
            height: 1,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 13, 7, 0.1)',
            width: '100%',
          }}
        />
      )}
    </View>
  );
}

// NFT List Content Component
function NFTListContent({
  selectedNFTs,
  needsScrollView,
  onRemoveNFT,
  isDark,
}: {
  selectedNFTs: NFTModel[];
  needsScrollView: boolean;
  onRemoveNFT: (id: string) => void;
  isDark: boolean;
}) {
  const renderNFTs = () =>
    selectedNFTs.map((nft, index) => (
      <NFTListItem
        key={getNFTId(nft)}
        nft={nft}
        index={index}
        total={selectedNFTs.length}
        onRemove={onRemoveNFT}
        isDark={isDark}
      />
    ));

  if (needsScrollView) {
    return (
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {renderNFTs()}
      </ScrollView>
    );
  }

  return <View className="flex-1">{renderNFTs()}</View>;
}

export default function BottomConfirmBar({
  selectedNFTs,
  onRemoveNFT,
  onExpandedChange,
  isEditing,
}: BottomConfirmBarProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const navigation = useNavigation();

  // Get store actions
  const { setSelectedNFTs, setTransactionType, setCurrentStep } = useSendStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const translateY = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  // Calculate dynamic expanded height based on number of NFTs
  const calculateExpandedHeight = () => {
    const contentHeight =
      HEADER_HEIGHT + selectedNFTs.length * NFT_ITEM_HEIGHT + BUTTON_AREA_HEIGHT;
    return Math.min(Math.max(contentHeight, MIN_EXPANDED_HEIGHT), MAX_EXPANDED_HEIGHT);
  };

  const dynamicExpandedHeight = calculateExpandedHeight();
  const needsScrollView =
    HEADER_HEIGHT + selectedNFTs.length * NFT_ITEM_HEIGHT + BUTTON_AREA_HEIGHT >
    MAX_EXPANDED_HEIGHT;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: selectedNFTs.length > 0 ? 0 : COLLAPSED_HEIGHT + insets.bottom + 20,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [selectedNFTs.length, translateY, insets.bottom]);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    // Notify parent about expansion state change
    onExpandedChange?.(isExpanded);
  }, [isExpanded, expandAnim, onExpandedChange]);

  // Auto-close drawer when no NFTs are selected
  useEffect(() => {
    if (selectedNFTs.length === 0 && isExpanded) {
      setIsExpanded(false);
    }
  }, [selectedNFTs.length, isExpanded]);

  const containerHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT + insets.bottom, dynamicExpandedHeight + insets.bottom],
  });

  const rotate = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRemoveNFT = (nftId: string) => {
    onRemoveNFT?.(nftId);
  };

  // Clean up NFTList/NFTDetail screens from navigation stack
  const cleanupNavigationStack = () => {
    setTimeout(() => {
      const state = navigation.getState();
      const newRoutes = [...state.routes];
      let hasChanges = false;

      // Remove NFTDetail if found
      const nftDetailIndex = newRoutes.findIndex(route => route.name === 'NFTDetail');
      if (nftDetailIndex > -1 && nftDetailIndex < newRoutes.length - 1) {
        newRoutes.splice(nftDetailIndex, 1);
        hasChanges = true;
      }

      // Remove NFTList if found (after potentially removing NFTDetail)
      const updatedNftListIndex = newRoutes.findIndex(route => route.name === 'NFTList');
      if (updatedNftListIndex > -1 && updatedNftListIndex < newRoutes.length - 1) {
        newRoutes.splice(updatedNftListIndex, 1);
        hasChanges = true;
      }

      if (hasChanges) {
        navigation.reset({
          index: newRoutes.length - 1,
          routes: newRoutes,
        });
      }
    }, 250);
  };

  const handleConfirm = () => {
    if (selectedNFTs.length === 0) {
      Alert.alert(t('alerts.error'), t('alerts.selectAtLeastOneNFT'));
      return;
    }

    // Save selected NFTs to store
    setSelectedNFTs(selectedNFTs);

    // Set appropriate transaction type
    const transactionType = selectedNFTs.length === 1 ? 'single-nft' : 'multiple-nfts';
    setTransactionType(transactionType);

    if (isEditing) {
      // Navigate back to appropriate NFT send screen
      const targetScreen = transactionType === 'single-nft' ? 'SendSingleNFT' : 'SendMultipleNFTs';
      navigation.navigate(targetScreen as never);
      cleanupNavigationStack();
    } else {
      // Continue with normal flow to select recipient
      setCurrentStep('send-to');
      (navigation as any).push('SendTo');
      cleanupNavigationStack();
    }
  };

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          bottom: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          transform: [{ translateY }],
          height: containerHeight,
          width: SCREEN_WIDTH,
          zIndex: 2, // Ensure drawer appears above the tint overlay
          backgroundColor: isDark ? '#FFFFFF15' : '#F2F2F7', // Surface background colors
        },
      ]}
      pointerEvents={selectedNFTs.length > 0 ? 'auto' : 'none'}
    >
      <View
        className="w-full h-full px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 88 }} // 88 = button container height (56 + 16 * 2)
      >
        <TouchableOpacity
          className="w-full flex-row justify-between items-center py-2.5"
          onPress={toggleExpanded}
        >
          <Text className="text-fg-1 font-inter" style={{ fontSize: 14 }}>
            {t('nft.selectedCount', { count: selectedNFTs.length })}
          </Text>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <ChevronDown width={24} height={24} color="#fff" />
          </Animated.View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View
            className="flex-1 my-2"
            style={[
              {
                opacity: expandAnim,
                transform: [
                  {
                    translateY: expandAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <NFTListContent
              selectedNFTs={selectedNFTs}
              needsScrollView={needsScrollView}
              onRemoveNFT={handleRemoveNFT}
              isDark={isDark}
            />
          </Animated.View>
        )}
      </View>

      <View
        className="absolute left-0 right-0 bottom-0 px-4"
        style={{ paddingBottom: insets.bottom + 16, paddingTop: 54 }}
      >
        <TouchableOpacity
          className={`w-full items-center justify-center ${isDark ? 'bg-white' : 'bg-black'}`}
          style={{
            borderRadius: 16, // Changed from 999px to 16px to match Figma
            paddingVertical: 16, // Changed from h-[52px] to padding approach
            paddingHorizontal: 20, // Added horizontal padding as per Figma
            borderWidth: 1,
            borderColor: isDark ? '#FFFFFF15' : '#F2F2F7', // Added white border as per Figma
            shadowColor: 'rgba(16, 24, 40, 0.05)', // Updated shadow to match Figma
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 1,
            shadowRadius: 2,
            elevation: 2, // Updated elevation for Android
          }}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Text
            className="font-inter"
            style={{
              color: '#252B34', // Changed from text-fg-4 to specific dark color from Figma
              fontSize: 16,
              fontWeight: '600',
              lineHeight: 19.2, // 1.2em as per Figma
              textAlign: 'center',
            }}
          >
            {t('nft.confirmCount', { count: selectedNFTs.length })}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
