# Screens Localization

This directory contains translation files for the shared screens package.

## Structure

```
locales/
├── en.json     # English translations
├── zh.json     # Chinese translations
└── README.md   # This file
```

## Adding a New Language

1. Create a new JSON file named with the language code (e.g., `es.json` for
   Spanish)
2. Copy the structure from `en.json`
3. Translate all the values to the target language
4. Import and add the new language in `../lib/i18n.ts`:

```typescript
import es from '../locales/es.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  es: { translation: es }, // Add new language here
};
```

## Translation Structure

The translations are organized into logical groups:

- `navigation`: Screen titles and navigation-related text
- `common`: Reusable UI text (buttons, states, etc.)
- `send`: Send flow specific translations
- `errors`: Error messages

## Translation Keys

Follow the nested structure pattern:

```json
{
  "send": {
    "myAccounts": "My Accounts",
    "sendTo": {
      "title": "Send To"
    }
  }
}
```

Access in code as: `t('send.myAccounts')` or `t('send.sendTo.title')`

## Best Practices

1. **Keep keys descriptive**: Use meaningful key names that indicate context
2. **Group related translations**: Organize by feature or screen
3. **Use interpolation for dynamic content**:
   ```json
   "welcome": "Welcome {{name}}"
   ```
4. **Provide context in complex translations**: Add comments for translators if
   needed
5. **Test with longer translations**: Some languages require more space than
   English

## Platform Integration

- **React Native**: Platforms can override or extend these translations via
  `initializeScreensI18n()`
- **Chrome Extension**: Can mix with Chrome's i18n system via the
  `useOwnTranslations` flag
- **Fallback**: If a translation key is missing, it will fall back to the key
  itself
