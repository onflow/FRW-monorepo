import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

import { useAndroidTextFix } from '@/lib/androidTextFix';

interface HoldToSendButtonProps {
  onPress: () => Promise<void>;
}

export const HoldToSendButton: React.FC<HoldToSendButtonProps> = ({ onPress }) => {
  const { t } = useTranslation();
  const [isHolding, setIsHolding] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const androidTextFix = useAndroidTextFix();
  const spinValue = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle hold state changes
  useEffect(() => {
    if (isHolding) {
      setShowSpinner(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else if (showSpinner) {
      // Keep spinner visible for 1.5 seconds after release
      timeoutRef.current = setTimeout(() => {
        setShowSpinner(false);
      }, 1500);
    }
  }, [isHolding, showSpinner]);

  // Spinner animation
  useEffect(() => {
    if (showSpinner) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    } else {
      spinValue.setValue(0);
    }
  }, [showSpinner, spinValue]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 18,
        marginBottom: 18,
        paddingVertical: 16,
        paddingHorizontal: 32,
        minHeight: 60,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
      }}
      onPressIn={() => setIsHolding(true)}
      onPressOut={() => setIsHolding(false)}
      onPress={onPress}
    >
      {showSpinner ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Animated.View
            style={{
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: 'rgba(0, 0, 0, 0.5)',
              borderTopColor: '#000000',
              borderRadius: 10,
              transform: [
                {
                  rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          />
          <Text
            style={[
              androidTextFix,
              {
                fontSize: 16,
                fontWeight: '600',
                color: '#000000',
                textAlign: 'center',
                flexShrink: 0,
                includeFontPadding: false,
                textAlignVertical: 'center',
                paddingRight: 8,
                borderRightWidth: 8,
                borderColor: 'transparent',
                minWidth: 200,
              },
            ]}
            allowFontScaling={false}
          >
            {t('send.holdToSend')}
          </Text>
        </View>
      ) : (
        <Text
          style={[
            androidTextFix,
            {
              fontSize: 16,
              fontWeight: '600',
              color: '#000000',
              textAlign: 'center',
              flexShrink: 0,
              includeFontPadding: false,
              textAlignVertical: 'center',
              paddingRight: 8,
              borderRightWidth: 8,
              borderColor: 'transparent',
              minWidth: 200,
            },
          ]}
          allowFontScaling={false}
        >
          Hold to send
        </Text>
      )}
    </TouchableOpacity>
  );
};
