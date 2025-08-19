# 🌍 i18n Translation Guide for FRW

## Overview

The Flow Reference Wallet uses an intelligent translation system that automatically translates new i18n keys while preserving blockchain terminology and maintaining context-aware translations.

## 🚀 Quick Start

### Available Commands

```bash
# Translate all missing keys to all languages  
pnpm translate

# Translate only Chinese
pnpm translate:zh  

# Translate only Spanish
pnpm translate:es

# Preview what would be translated (dry run)
pnpm translate:dry

# Force re-translate all keys (use with caution)
pnpm translate:force
```

### Claude Code Integration

Use the custom Claude command:

```bash
/i18n zh --dry-run    # Preview Chinese translations
/i18n                 # Translate all languages  
/i18n es              # Translate Spanish only
```

## 📁 File Structure

```
packages/screens/src/locales/
├── en.json         # English source (reference)
├── zh.json         # Chinese translations
├── es.json         # Spanish translations  
└── README.md       # Locales documentation

.claude/
├── commands/i18n.md         # Claude command definition
└── translation-memory.json  # Translation memory & settings

packages/screens/scripts/
└── translate-i18n.js        # Translation automation script
```

## 🧠 Translation Intelligence

### Context-Aware Translation

The system understands your Flow wallet context:

- **Product**: Self-custody blockchain wallet
- **Domain**: Cryptocurrency, DeFi, NFTs, Flow blockchain  
- **UI Context**: Mobile app and browser extension
- **Users**: Crypto users managing Flow/EVM assets

### Technical Term Preservation  

These terms are **never translated**:
- `NFT`, `DeFi`, `dApp`, `Flow`, `EVM`
- `HODL`, `staking`, `validator` 
- `mainnet`, `testnet`, `gas fee`
- `smart contract`, `seed phrase`, `custody`

### Language-Specific Rules

#### Chinese (zh)
- Uses Simplified Chinese
- Formal but friendly tone
- Technical terms in English
- Example: "质押" for staking, "代币" for token

#### Spanish (es)  
- International Spanish (non-regional)
- Formal register for financial terms
- Crypto terms often kept in English
- Example: "Staking" preserved, "billetera" for wallet

## 📝 Workflow Example

### 1. Add New Features to English

Edit `packages/screens/src/locales/en.json`:

```json
{
  "defi": {
    "title": "DeFi",
    "swapTokens": "Swap Tokens",
    "addLiquidity": "Add Liquidity",
    "slippageTolerance": "Slippage Tolerance"
  }
}
```

### 2. Run Translation Command

```bash
pnpm translate:dry  # Preview first
pnpm translate      # Apply translations
```

### 3. Review & Confirm

The system outputs:
```
🤖 Translating 4 keys to zh...
   Translating: defi.swapTokens = "Swap Tokens"
   Result: "代币兑换"
   
✅ Updated packages/screens/src/locales/zh.json
✅ Updated packages/screens/src/locales/es.json
```

### 4. Manual Review (Recommended)

Always review automated translations for:
- ✅ Cultural appropriateness  
- ✅ UI context accuracy
- ✅ Terminology consistency
- ✅ Technical term preservation

## 🔧 Translation Memory

The system maintains memory in `.claude/translation-memory.json`:

```json
{
  "confirmed_translations": {
    "zh": {
      "staking.title": "质押",
      "defi.swapTokens": "代币兑换"
    }
  },
  "preserve_terms": ["NFT", "Flow", "DeFi"],
  "context_notes": {
    "wallet_terms": {
      "zh": { "wallet": "钱包", "account": "账户" }
    }
  }
}
```

### Benefits:
- 🚫 **No Re-translation**: Confirmed translations won't be changed
- 📈 **Consistency**: Maintains terminology across updates  
- 🧠 **Learning**: Improves with each translation session

## 🎯 Best Practices

### For Developers

1. **Always use `--dry-run` first** to preview changes
2. **Review automated translations** before committing
3. **Update translation memory** for important terminology  
4. **Test UI** with translated text (especially longer languages)

### For Translators

1. **Understand context** - know which screen/feature uses each key
2. **Preserve branding** - keep "Flow" and crypto terms consistent
3. **Consider UI space** - some languages need more characters
4. **Maintain tone** - financial tools require professional language

### Key Naming Convention

```json
{
  "feature": {
    "action": "Action Button",           // Button text
    "title": "Feature Title",            // Screen/section title  
    "subtitle": "Explanatory text",     // Supporting description
    "placeholder": "Input hint...",      // Form placeholder
    "errors": {
      "specific": "Error message"        // Error states
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues

**Missing translations after update:**
```bash
pnpm translate:dry  # Check what's missing
pnpm translate      # Apply missing translations
```

**Incorrect automated translation:**
1. Edit the target language file manually
2. Add to translation memory to prevent re-translation
3. Consider improving the English source text

**JSON syntax errors:**
```bash
pnpm lint:packages  # Check JSON syntax
```

**Translation memory conflicts:**
```bash
# Reset translation memory (use carefully)
rm .claude/translation-memory.json
```

## 🔮 Future Enhancements

- **AI Integration**: Direct Claude API integration for real-time translation
- **More Languages**: Support for Japanese, Korean, French, etc.
- **Context Screenshots**: Visual context for better translation accuracy  
- **Translation Validation**: Automated checks for missing interpolation variables
- **Collaborative Review**: Multi-reviewer workflow for critical translations

## 📞 Support

For translation issues:
1. Check this guide first
2. Review `.claude/translation-memory.json` 
3. Test with `--dry-run` mode
4. Create GitHub issue with translation context

---

Happy translating! 🌍✨