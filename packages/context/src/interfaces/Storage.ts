/**
 * Storage interface for platform-agnostic storage operations
 * Implementations should provide persistent storage functionality
 */
export interface Storage {
  /**
   * Set a value for the given `key`.
   *
   * @throws an Error if the value cannot be set.
   */
  set: (key: string, value: boolean | string | number | ArrayBuffer) => void;
  /**
   * Get the boolean value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getBoolean: (key: string) => boolean | undefined;
  /**
   * Get the string value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getString: (key: string) => string | undefined;
  /**
   * Get the number value for the given `key`, or `undefined` if it does not exist.
   *
   * @default undefined
   */
  getNumber: (key: string) => number | undefined;
  /**
   * Get a raw buffer of unsigned 8-bit (0-255) data.
   *
   * @default undefined
   */
  getBuffer: (key: string) => ArrayBufferLike | undefined;
  /**
   * Checks whether the given `key` is being stored in this MMKV instance.
   */
  contains: (key: string) => boolean;
  /**
   * Delete the given `key`.
   */
  delete: (key: string) => void;
  /**
   * Get all keys.
   *
   * @default []
   */
  getAllKeys: () => string[];
  /**
   * Delete all keys.
   */
  clearAll: () => void;
  /**
   * Sets (or updates) the encryption-key to encrypt all data in this MMKV instance with.
   *
   * To remove encryption, pass `undefined` as a key.
   *
   * Encryption keys can have a maximum length of 16 bytes.
   *
   * @throws an Error if the instance cannot be recrypted.
   */
  recrypt: (key: string | undefined) => void;
  /**
   * Trims the storage space and clears memory cache.
   *
   * Since MMKV does not resize itself after deleting keys, you can call `trim()`
   * after deleting a bunch of keys to manually trim the memory- and
   * disk-file to reduce storage and memory usage.
   *
   * In most applications, this is not needed at all.
   */
  trim(): void;
}