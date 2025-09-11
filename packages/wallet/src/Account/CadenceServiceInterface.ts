/**
 * Cadence Service Interface for querying Flow blockchain
 * This interface abstracts the actual CadenceService to avoid circular dependencies
 */

export interface CadenceServiceInterface {
  getChildAddresses(parent: string): Promise<string[]>;
  getChildAccountMeta(parent: string): Promise<Record<string, unknown>>;
  getAddr(flowAddress: string): Promise<string | null>;
}
