/**
 * Storage abstraction for key persistence - exact match to iOS StorageProtocol.swift
 */

/**
 * Storage abstraction for key persistence - exact match to iOS StorageProtocol.swift
 */
export interface StorageProtocol {
  allKeys(): Promise<string[]>;
  findKey(keyword: string): Promise<string[]>;
  get(key: string): Promise<Uint8Array | null>;
  set(key: string, value: Uint8Array): Promise<void>;
  remove(key: string): Promise<void>;
  removeAll(): Promise<void>;
}
