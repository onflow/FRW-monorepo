# FRW-RN Localization System

This directory contains the internationalization (i18n) setup for the FRW React Native application using `react-i18next` and Crowdin integration.

## Structure

```
src/locales/
├── en.json          # English translations (base language)
├── es.json          # Spanish translations (example)
└── README.md        # This file
```

## Usage

### Basic Translation

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return <Text>{t('home.title')}</Text>;
};
```

### With Custom Hook

```tsx
import { useLanguage } from '@/hooks/useLanguage';

const LanguageSettings = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const switchToSpanish = () => {
    changeLanguage('es');
  };

  return (
    <View>
      <Text>
        {t('common.currentLanguage')}: {currentLanguage}
      </Text>
      <Button onPress={switchToSpanish}>{t('common.switchToSpanish')}</Button>
    </View>
  );
};
```

## Adding New Languages

1. Create a new JSON file (e.g., `fr.json` for French)
2. Copy the structure from `en.json`
3. Translate all values
4. Update `src/lib/i18n.ts` to import and register the new language:

```typescript
import fr from '../locales/fr.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr }, // Add new language
};
```

## Translation Key Structure

```json
{
  "navigation": {
    "home": "Home",
    "settings": "Settings"
  },
  "home": {
    "title": "Welcome",
    "subtitle": "Start your journey"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

## Crowdin Integration

### Setup

1. Update `crowdin.yml` with your project ID
2. Set `CROWDIN_API_TOKEN` in GitHub secrets
3. Push changes to trigger automatic sync

### Workflow

1. Developers update `en.json` with new keys
2. GitHub Action uploads source strings to Crowdin
3. Translators translate content on Crowdin platform
4. GitHub Action creates PRs with updated translations
5. Merge PRs to get translations in app

## Best Practices

1. **Use descriptive keys**: `home.welcomeMessage` instead of `msg1`
2. **Group by feature**: Keep related translations together
3. **Include context**: Add comments in Crowdin for complex phrases
4. **Test all languages**: Ensure UI adapts to different text lengths
5. **Handle plurals**: Use i18next plural forms when needed

```json
{
  "items": {
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}
```

Usage:

```tsx
<Text>{t('items', { count: itemCount })}</Text>
```

## TypeScript Support

The system includes full TypeScript support with:

- Autocomplete for translation keys
- Type checking for interpolation values
- Compile-time validation of key existence

Update `src/types/i18n.ts` when adding new translation files.
