import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('ImportAccount screen integration', () => {
  it('exports ImportAccountScreen from recovery module', () => {
    const recoveryIndexPath = path.resolve(__dirname, '..', 'src', 'recovery', 'index.ts');
    const recoveryIndexContent = fs.readFileSync(recoveryIndexPath, 'utf-8');
    expect(recoveryIndexContent).toContain('ImportAccountScreen');
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
});
