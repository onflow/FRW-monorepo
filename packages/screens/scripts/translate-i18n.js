#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * Intelligent i18n Translation Script for Flow Reference Wallet
 * 
 * Usage:
 *   node scripts/translate-i18n.js [language] [--dry-run] [--force]
 * 
 * Examples:
 *   node scripts/translate-i18n.js zh --dry-run
 *   node scripts/translate-i18n.js es
 *   node scripts/translate-i18n.js --force
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const TRANSLATION_MEMORY = path.join(__dirname, '../../../.claude/translation-memory.json');
const SUPPORTED_LANGUAGES = ['zh', 'es'];

// Flow wallet context for Claude AI translation (for future AI integration)
// const TRANSLATION_CONTEXT = {
//   product: "Flow Reference Wallet - Self-custody blockchain wallet",
//   domain: "Cryptocurrency, DeFi, NFT, Flow blockchain",
//   ui_context: "Mobile app and browser extension interfaces",
//   target_users: "Crypto users managing Flow/EVM assets"
// };

// Technical terms that should never be translated
const PRESERVE_TERMS = [
  'NFT', 'DeFi', 'dApp', 'Flow', 'EVM', 'HODL', 
  'staking', 'validator', 'mainnet', 'testnet', 
  'gas fee', 'smart contract', 'seed phrase', 'custody'
];

class I18nTranslator {
  constructor() {
    this.translationMemory = this.loadTranslationMemory();
    this.dryRun = process.argv.includes('--dry-run');
    this.force = process.argv.includes('--force');
    this.targetLanguage = process.argv[2]?.match(/^[a-z]{2}$/) ? process.argv[2] : null;
  }

  loadTranslationMemory() {
    try {
      return JSON.parse(fs.readFileSync(TRANSLATION_MEMORY, 'utf8'));
    } catch {
      console.warn('⚠️  Translation memory not found, creating new one...');
      return {
        confirmed_translations: {},
        preserve_terms: PRESERVE_TERMS,
        context_notes: {},
        last_updated: new Date().toISOString().split('T')[0],
        version: "1.0"
      };
    }
  }

  loadJsonFile(filePath) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error(`❌ Failed to load ${filePath}:`, error.message);
      return null;
    }
  }

  flattenObject(obj, prefix = '') {
    const flattened = {};
    for (const key in obj) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, this.flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
    return flattened;
  }

  unflattenObject(flatObj) {
    const unflattened = {};
    for (const key in flatObj) {
      const keys = key.split('.');
      let current = unflattened;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = flatObj[key];
    }
    return unflattened;
  }

  findMissingKeys(sourceFlat, targetFlat) {
    const missing = {};
    for (const key in sourceFlat) {
      if (!Object.prototype.hasOwnProperty.call(targetFlat, key) || this.force) {
        if (!this.force && this.translationMemory.confirmed_translations[this.currentLang]?.[key]) {
          continue; // Skip confirmed translations unless forced
        }
        missing[key] = sourceFlat[key];
      }
    }
    return missing;
  }

  async translateText(text, targetLang, _context = '') {
    // This is where you would integrate with Claude AI API
    // For now, return a placeholder that shows the translation structure

    // Placeholder translations for demo
    const demoTranslations = {
      zh: {
        'Staking': '质押',
        'Earn rewards': '获得奖励', 
        'Validator': '验证节点',
        'Swap Tokens': '代币兑换',
        'Add Liquidity': '添加流动性'
      },
      es: {
        'Staking': 'Staking',
        'Earn rewards': 'Gana recompensas',
        'Validator': 'Validador', 
        'Swap Tokens': 'Intercambiar Tokens',
        'Add Liquidity': 'Añadir Liquidez'
      }
    };

    return demoTranslations[targetLang]?.[text] || `[${targetLang.toUpperCase()}] ${text}`;
  }

  async translateMissingKeys(missingKeys, targetLang) {
    const translations = {};
    
    console.log(`🤖 Translating ${Object.keys(missingKeys).length} keys to ${targetLang}...`);
    
    for (const [key, value] of Object.entries(missingKeys)) {
      if (typeof value === 'string') {
        console.log(`   Translating: ${key} = "${value}"`);
        const translated = await this.translateText(value, targetLang, key);
        translations[key] = translated;
        console.log(`   Result: "${translated}"`);
      } else {
        translations[key] = value; // Keep non-string values as-is
      }
    }
    
    return translations;
  }

  async processLanguage(lang) {
    console.log(`\n📍 Processing ${lang.toUpperCase()} translations...`);
    this.currentLang = lang;
    
    const sourcePath = path.join(LOCALES_DIR, 'en.json');
    const targetPath = path.join(LOCALES_DIR, `${lang}.json`);
    
    const sourceData = this.loadJsonFile(sourcePath);
    const targetData = this.loadJsonFile(targetPath) || {};
    
    if (!sourceData) return;
    
    const sourceFlat = this.flattenObject(sourceData);
    const targetFlat = this.flattenObject(targetData);
    
    const missingKeys = this.findMissingKeys(sourceFlat, targetFlat);
    
    if (Object.keys(missingKeys).length === 0) {
      console.log('✅ All translations are up to date!');
      return;
    }
    
    console.log(`📝 Found ${Object.keys(missingKeys).length} missing keys:`);
    Object.keys(missingKeys).forEach(key => {
      console.log(`   - ${key}: "${missingKeys[key]}"`);
    });
    
    if (this.dryRun) {
      console.log('🔍 Dry run mode - no files will be modified');
      return;
    }
    
    const translations = await this.translateMissingKeys(missingKeys, lang);
    
    // Merge translations
    const updatedFlat = { ...targetFlat, ...translations };
    const updatedData = this.unflattenObject(updatedFlat);
    
    // Write updated file
    fs.writeFileSync(targetPath, JSON.stringify(updatedData, null, 2) + '\n');
    console.log(`✅ Updated ${targetPath}`);
    
    // Update translation memory
    if (!this.translationMemory.confirmed_translations[lang]) {
      this.translationMemory.confirmed_translations[lang] = {};
    }
    Object.assign(this.translationMemory.confirmed_translations[lang], translations);
  }

  async run() {
    console.log('🌍 Flow Wallet i18n Translation Tool');
    console.log('=====================================');
    
    const languages = this.targetLanguage ? [this.targetLanguage] : SUPPORTED_LANGUAGES;
    
    for (const lang of languages) {
      if (!SUPPORTED_LANGUAGES.includes(lang)) {
        console.error(`❌ Unsupported language: ${lang}`);
        continue;
      }
      
      await this.processLanguage(lang);
    }
    
    // Save translation memory
    this.translationMemory.last_updated = new Date().toISOString().split('T')[0];
    fs.writeFileSync(TRANSLATION_MEMORY, JSON.stringify(this.translationMemory, null, 2));
    
    console.log('\n🎉 Translation process completed!');
  }
}

// Run the translator
if (require.main === module) {
  const translator = new I18nTranslator();
  translator.run().catch(console.error);
}

module.exports = I18nTranslator;