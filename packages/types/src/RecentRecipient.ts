export interface RecentRecipient {
  id: string;
  name: string;
  address: string;
  emoji?: string;
  avatar?: string;
  lastUsed: number; // timestamp
  source: 'local' | 'server'; // track where it came from
}
