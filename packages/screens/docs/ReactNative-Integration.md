# React Native Integration Guide

This guide shows how to integrate the shared screens package with React Native,
including i18n and navigation setup.

## 1. App Setup

Initialize the ServiceContext with your platform implementation:

```typescript
// App.tsx
import { ServiceContext } from '@onflow/frw-context';
import { initializeScreensI18n } from '@onflow/frw-screens';
import { platform } from '@/bridge/PlatformImpl';
import App from './src/App';

// Initialize the service context
ServiceContext.initialize(platform);

// Initialize screens i18n with React Native's current language
initializeScreensI18n({
  language: 'en', // Get from AsyncStorage or device locale
  platformTranslations: {
    // Override or add platform-specific translations
    en: {
      'platform.specific.key': 'React Native specific text',
    },
  },
});

// Screens package now supports multiple languages out of the box:
// - en (English)
// - zh (Chinese)
// - es (Spanish)
// Add more languages by creating JSON files in packages/screens/src/locales/

export default App;
```

## 2. Screen Usage

Use shared screens in your React Native components:

```tsx
// screens/SendToFlow.tsx
import { SendToScreen, useNavigation } from '@onflow/frw-screens';
import { usePlatformBridge } from '@/hooks/usePlatformBridge';

export const SendToFlow = () => {
  const bridge = usePlatformBridge();

  return (
    <SendToScreen
      bridge={bridge}
      // Optional: Platform can override specific translations
      i18nConfig={{
        useOwnTranslations: false, // Use screens' i18n
        language: 'en',
      }}
      // Platform-specific data loading
      loadAccountsData={async () => {
        return await MyAccountService.getAccounts();
      }}
      loadRecentData={async () => {
        return await MyRecentService.getRecent();
      }}
    />
  );
};
```

## 3. Navigation Setup

Set up the navigation reference in your AppNavigator:

```tsx
// navigation/AppNavigator.tsx
import { reactNativeNavigation } from '@/bridge/ReactNativeNavigation';

const AppNavigator = () => {
  const navigationRef = useRef<any>();

  useEffect(() => {
    reactNativeNavigation.setNavigationRef(navigationRef);
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name="SendTo" component={SendToFlow} />
        {/* other screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## 4. Platform Bridge Implementation

Create a simple bridge for screen-specific functionality:

```typescript
// hooks/usePlatformBridge.ts
import { useProfiles } from '@/hooks/useProfiles';
import { useNetwork } from '@/hooks/useNetwork';

export const usePlatformBridge = () => {
  const { currentProfile } = useProfiles();
  const { network } = useNetwork();

  return {
    getSelectedAddress: () => currentProfile?.address || null,
    getNetwork: () => network,
    getCoins: () => null, // Implement as needed
  };
};
```

## 5. Language Switching

To change languages at runtime:

```typescript
// components/LanguageSwitcher.tsx
import { screensI18n } from '@onflow/frw-screens';

export const switchLanguage = (newLanguage: string) => {
  screensI18n.changeLanguage(newLanguage);
};
```

This setup allows you to use shared screens with React Native while maintaining
platform-specific customization for navigation, data loading, and translations.
