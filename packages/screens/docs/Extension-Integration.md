# Chrome Extension Integration Guide

This guide shows how to integrate the shared screens package with Chrome
Extension, including i18n and navigation setup.

## 1. Extension Setup

Initialize the ServiceContext in your extension:

```typescript
// ui/index.tsx
import { ServiceContext } from '@onflow/frw-context';
import {
  initializeScreensI18n,
  screensTranslations,
} from '@onflow/frw-screens';
import { getPlatform } from '@/bridge/PlatformImpl';

// Initialize service context
const platform = getPlatform();
ServiceContext.initialize(platform);

// Initialize screens i18n with extension's translations
initializeScreensI18n({
  language: 'en', // Get from chrome.storage or user preference
  platformTranslations: {
    // Merge Chrome i18n messages with screens translations
    en: {
      ...screensTranslations.en.translation,
      'chrome.specific.key': chrome.i18n.getMessage('chromeSpecificKey'),
    },
    // Support for additional languages
    zh: {
      ...screensTranslations.zh.translation,
      'chrome.specific.key': chrome.i18n.getMessage('chromeSpecificKey'),
    },
  },
});

// Available languages in screens package:
// - en (English) - Default
// - zh (Chinese)
// - es (Spanish)
// Each stored in separate JSON files for easy maintenance
```

## 2. Screen Usage in Extension Routes

Use shared screens in your extension routes:

```tsx
// views/SendToScreenView/index.tsx
import { SendToScreen } from '@onflow/frw-screens';
import {
  usePlatformBridge,
  usePlatformTranslation,
} from '@/bridge/PlatformContext';

const SendToScreenView = () => {
  const bridge = usePlatformBridge();
  const t = usePlatformTranslation();

  return (
    <SendToScreen
      bridge={bridge}
      t={t} // Use extension's translation function
      i18nConfig={{
        useOwnTranslations: true, // Use extension's Chrome i18n
      }}
      // Extension-specific data loading
      loadAccountsData={async () => {
        const wallet = useWallet();
        return await wallet.getWallets();
      }}
    />
  );
};

export default SendToScreenView;
```

## 3. Navigation Setup

The extension navigation is automatically set up in PlatformContext:

```tsx
// bridge/PlatformContext.tsx (already implemented)
export const PlatformProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    extensionNavigation.setNavigateCallback(navigate);
    extensionNavigation.setLocationRef({ current: location });
  }, [navigate, location]);

  // ... rest of provider
};
```

## 4. Route Mapping

Screen navigation calls are mapped to extension routes:

```typescript
// bridge/ExtensionNavigation.ts
private convertScreenToPath(screen: string): string {
  const screenMapping: Record<string, string> = {
    'SendTo': '/send-to-screen',
    'SendTokens': '/send-tokens-screen',
    'SelectTokens': '/select-tokens-screen',
    // Add more mappings as needed
  };
  return screenMapping[screen] || `/${screen.toLowerCase()}`;
}
```

## 5. Translation Integration

Mix Chrome i18n with screens translations:

```typescript
// bridge/PlatformContext.tsx
const getTranslation = (): TranslationFunction => {
  return (key: string, options?: Record<string, unknown>) => {
    // Try Chrome i18n first
    const chromeKey = key.replace(/\./g, '__');
    const message = chrome.i18n.getMessage(chromeKey);

    if (message) {
      return message;
    }

    // Fallback to screens translations
    return screensI18n.t(key, options);
  };
};
```

## 6. Extension Routes Setup

Add screen routes to your router:

```tsx
// views/InnerRoute.tsx
import SendToScreenView from './SendToScreenView';
import SendTokensScreenView from './SendTokensScreenView';

const InnerRoute = () => {
  return (
    <Routes>
      {/* Existing routes */}
      <Route path="/send-to-screen" element={<SendToScreenView />} />
      <Route path="/send-tokens-screen" element={<SendTokensScreenView />} />
      {/* More screen routes */}
    </Routes>
  );
};
```

This setup allows the Chrome extension to use shared screens while maintaining
its existing Chrome i18n system and React Router navigation.
