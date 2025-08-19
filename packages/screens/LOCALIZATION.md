# Screens Package Localization Structure

The screens package i18n has been refactored to use separate JSON files for
better maintainability, following the React Native locales pattern.

## 📁 New File Structure

```
packages/screens/src/
├── locales/
│   ├── en.json       # English translations
│   ├── es.json       # Spanish translations
│   ├── zh.json       # Chinese translations
│   └── README.md     # Documentation
├── lib/
│   ├── i18n.ts       # i18n configuration (now imports JSON files)
│   └── withScreensI18n.tsx
└── send/
    └── SendToScreen.tsx (uses centralized i18n)
```

## 🔄 Migration Benefits

**Before (Single File):**

- All translations in one large TypeScript file
- Hard to manage multiple languages
- Difficult for translators to work with

**After (Separate JSON Files):**

- Each language in its own JSON file
- Easy to add new languages
- Translator-friendly format
- Better version control (smaller diffs)
- Follows React Native convention

## 🌍 Supported Languages

| Language | Code | File      | Status      |
| -------- | ---- | --------- | ----------- |
| English  | `en` | `en.json` | ✅ Complete |
| Chinese  | `zh` | `zh.json` | ✅ Complete |
| Spanish  | `es` | `es.json` | ✅ Complete |

## 📝 Translation Structure

Each JSON file follows this structure:

```json
{
  "navigation": {
    /* Screen titles */
  },
  "common": {
    /* Reusable UI elements */
  },
  "send": {
    /* Send flow specific */
  },
  "errors": {
    /* Error messages */
  }
}
```

## 🔧 How to Add a New Language

1. **Create JSON file**: `src/locales/[language-code].json`
2. **Copy structure**: Use `en.json` as template
3. **Translate values**: Keep keys the same, translate values
4. **Import in i18n.ts**:

   ```typescript
   import newLang from '../locales/new-lang.json';

   const resources = {
     // ... existing languages
     'new-lang': {
       translation: newLang,
     },
   };
   ```

## 🎯 Usage in Screens

Screens automatically get the translation function:

```tsx
// In any screen component
function MyScreen({ t }: { t: TranslationFunction }) {
  return <Text>{t('send.myAccounts')}</Text>;
}

// Or with the HOC
export const MyScreen = withScreensI18n(MyScreenBase);
```

## 🔗 Platform Integration

### React Native

```typescript
import { initializeScreensI18n } from '@onflow/frw-screens';

initializeScreensI18n({
  language: 'en', // or 'zh', 'es'
  platformTranslations: {
    // Platform-specific overrides
  },
});
```

### Chrome Extension

```typescript
// Can mix with Chrome's i18n or use screens' translations
const t = usePlatformTranslation(); // Uses Chrome i18n
// OR
i18nConfig={{ useOwnTranslations: false }} // Uses screens i18n
```

This structure makes it much easier to manage translations and add new
languages! 🚀
