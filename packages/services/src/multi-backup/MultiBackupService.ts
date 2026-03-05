import { logger } from '@onflow/frw-context';
import * as bip39 from 'bip39';

import {
  decryptAesHexCbc,
  parseEncryptedHexPayload,
  toPasswordIOS,
  toPasswordString,
} from './crypto';
import type {
  MultiBackupDriveItem,
  MultiBackupRestoreInput,
  MultiBackupServiceConfig,
  MultiBackupStoreItem,
} from './types';

export class MultiBackupService {
  private readonly appBackupKey: string;
  private readonly mnemonicMetadataMatcher?: MultiBackupServiceConfig['mnemonicMetadataMatcher'];

  constructor(config: MultiBackupServiceConfig) {
    this.appBackupKey = config.appBackupKey;
    this.mnemonicMetadataMatcher = config.mnemonicMetadataMatcher;
  }

  async decodeMultiBackupPayload(rawText: string): Promise<MultiBackupDriveItem[]> {
    const encryptedHex = parseEncryptedHexPayload(rawText);
    const iv = await toPasswordIOS(this.appBackupKey);
    const decrypted = decryptAesHexCbc(encryptedHex, this.appBackupKey, iv);
    const items = JSON.parse(decrypted) as MultiBackupStoreItem[];
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Not multi-backup format');
    }
    if (
      (items[0].userName === null || items[0].userName === undefined) &&
      (items[0] as unknown as { username?: string }).username !== null &&
      (items[0] as unknown as { username?: string }).username !== undefined
    ) {
      throw new Error('Legacy backup format');
    }
    return items.map((item) => ({
      username: item.userName,
      uid: item.userId ?? null,
      data: item.data,
      version: '1.0',
      time:
        item.updatedTime !== null && item.updatedTime !== undefined
          ? String(item.updatedTime)
          : null,
      code: item.code,
      publicKey: item.publicKey,
      address: item.address,
      keyIndex: item.keyIndex,
      signAlgo: item.signAlgo,
      hashAlgo: item.hashAlgo,
    }));
  }

  listUsernames(items: MultiBackupDriveItem[]): string[] {
    return items.map((item) => item.username);
  }

  async restoreMnemonic(
    items: MultiBackupDriveItem[],
    input: MultiBackupRestoreInput
  ): Promise<string | null> {
    if (!items || items.length === 0) {
      return null;
    }

    let selected = input.uid ? items.find((item) => item.uid === input.uid) : undefined;
    if (!selected) {
      selected = items.find((item) => item.username === input.username);
    }
    if (!selected) {
      return null;
    }

    const tryDecryptWithCandidate = async (candidate: string): Promise<string | null> => {
      const iv = await toPasswordIOS(candidate);
      const mnemonic = decryptAesHexCbc(selected.data, candidate, iv);
      if (!bip39.validateMnemonic(mnemonic)) {
        return null;
      }
      if (!this.mnemonicMetadataMatcher) {
        return mnemonic;
      }
      const matched = await this.mnemonicMetadataMatcher(mnemonic, selected);
      return matched ? mnemonic : null;
    };

    const candidates: string[] = [];
    const pushCandidate = (value?: string) => {
      if (!value) return;
      if (!candidates.includes(value)) candidates.push(value);
    };

    pushCandidate(input.passwordOverride);
    if (input.passwordOverride) {
      pushCandidate(await toPasswordString(input.passwordOverride));
    }

    pushCandidate(this.appBackupKey);

    if (selected.code) {
      pushCandidate(await toPasswordString(selected.code));
      pushCandidate(selected.code);
    }

    for (const candidate of candidates) {
      try {
        const restored = await tryDecryptWithCandidate(candidate);
        if (restored) return restored;
      } catch (error) {
        logger.debug('[MultiBackupService] Candidate decrypt failed', error);
      }
    }

    throw new Error(
      'Failed to decrypt Multi Backup mnemonic. Check backup password/PIN or backup key.'
    );
  }
}
