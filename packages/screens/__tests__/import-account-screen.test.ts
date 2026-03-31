import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('ImportAccount screen integration', () => {
  it('exports ImportAccountScreen from importAccount module', () => {
    const importAccountIndexPath = path.resolve(
      __dirname,
      '..',
      'src',
      'importAccount',
      'index.ts'
    );
    const importAccountIndexContent = fs.readFileSync(importAccountIndexPath, 'utf-8');
    expect(importAccountIndexContent).toContain('ImportAccountScreen');
  });

  it('exports ImportCloudMultiBackupScreen from importAccount module', () => {
    const importAccountIndexPath = path.resolve(
      __dirname,
      '..',
      'src',
      'importAccount',
      'index.ts'
    );
    const importAccountIndexContent = fs.readFileSync(importAccountIndexPath, 'utf-8');
    expect(importAccountIndexContent).toContain('ImportCloudMultiBackupScreen');
  });

  it('exports ImportLegacyMethodsScreen from importAccount module', () => {
    const importAccountIndexPath = path.resolve(
      __dirname,
      '..',
      'src',
      'importAccount',
      'index.ts'
    );
    const importAccountIndexContent = fs.readFileSync(importAccountIndexPath, 'utf-8');
    expect(importAccountIndexContent).toContain('ImportLegacyMethodsScreen');
  });

  it('exports ImportCloudBackupLoadingScreen from importAccount module', () => {
    const importAccountIndexPath = path.resolve(
      __dirname,
      '..',
      'src',
      'importAccount',
      'index.ts'
    );
    const importAccountIndexContent = fs.readFileSync(importAccountIndexPath, 'utf-8');
    expect(importAccountIndexContent).toContain('ImportCloudBackupLoadingScreen');
  });

  it('contains onboarding.importAccount locale keys in en', () => {
    const enLocalePath = path.resolve(__dirname, '..', 'src', 'locales', 'en.json');
    const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf-8'));

    expect(enLocale).toHaveProperty('onboarding.importAccount.title');
    expect(enLocale).toHaveProperty('onboarding.importAccount.subtitle');
    expect(enLocale).toHaveProperty('onboarding.importAccount.deviceBackup.title');
    expect(enLocale).toHaveProperty('onboarding.importAccount.cloudBackup.title');
    expect(enLocale).toHaveProperty('onboarding.importAccount.recoveryPhrase.title');
    expect(enLocale).toHaveProperty('onboarding.importAccount.anotherMethod.title');
  });

  it('contains onboarding.importCloudMultiBackup locale keys in en', () => {
    const enLocalePath = path.resolve(__dirname, '..', 'src', 'locales', 'en.json');
    const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf-8'));

    expect(enLocale).toHaveProperty('onboarding.importCloudMultiBackup.subtitle');
    expect(enLocale).toHaveProperty('onboarding.importCloudMultiBackup.providers.googleDrive');
    expect(enLocale).toHaveProperty('onboarding.importCloudMultiBackup.providers.iCloud');
    expect(enLocale).toHaveProperty('onboarding.importCloudMultiBackup.providers.dropbox');
    expect(enLocale).toHaveProperty('onboarding.importCloudMultiBackup.loading.title');
    expect(enLocale).toHaveProperty('onboarding.importCloudMultiBackup.loading.status');
  });

  it('contains onboarding.importAccount.legacyMethodsSubtitle locale key in en', () => {
    const enLocalePath = path.resolve(__dirname, '..', 'src', 'locales', 'en.json');
    const enLocale = JSON.parse(fs.readFileSync(enLocalePath, 'utf-8'));

    expect(enLocale).toHaveProperty('onboarding.importAccount.legacyMethodsSubtitle');
  });
});
