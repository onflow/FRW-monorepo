import type { ActivityItem } from '@onflow/frw-types';

/**
 * Mock data for previewing ActivityDetailScreen in different configurations
 * This file is for development/testing purposes only
 */

// Base timestamp for mock data
const now = Date.now();
const oneHourAgo = now - 60 * 60 * 1000;
const oneDayAgo = now - 24 * 60 * 60 * 1000;

/**
 * NFT Received - Flow
 */
export const mockNftReceivedFlow: ActivityItem = {
  id: 'mock-nft-received-flow',
  hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  title: 'TopShot Moment',
  token: 'NBA Top Shot',
  image: 'https://assets.nbatopshot.com/media/1234567/image.png',
  amount: '1',
  sender: '0xabcdef1234567890',
  receiver: '0x1234567890abcdef',
  receiverProfile: {
    emoji: '🏀',
    name: 'Main Account',
    color: '#FF6B6B',
  },
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneHourAgo,
  type: 'nft',
  transferType: 'received',
  walletType: 'flow',
};

/**
 * NFT Sent - Flow
 */
export const mockNftSentFlow: ActivityItem = {
  id: 'mock-nft-sent-flow',
  hash: '0x2345678901bcdef02345678901bcdef02345678901bcdef02345678901bcdef0',
  title: 'CryptoKitty #42',
  token: 'CryptoKitties',
  image: 'https://img.cryptokitties.co/0x06012c8cf97bead5deae237070f9587f8e7a266d/42.png',
  amount: '2',
  sender: '0x1234567890abcdef',
  senderProfile: {
    emoji: '😺',
    name: 'NFT Vault',
    color: '#4ECDC4',
  },
  receiver: '0xfedcba0987654321',
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneDayAgo,
  type: 'nft',
  transferType: 'sent',
  walletType: 'flow',
};

/**
 * NFT Received - EVM
 */
export const mockNftReceivedEvm: ActivityItem = {
  id: 'mock-nft-received-evm',
  hash: '0x3456789012cdef013456789012cdef013456789012cdef013456789012cdef01',
  title: 'Bored Ape',
  token: 'BAYC',
  image: 'https://i.seadn.io/gae/example-bayc.png',
  amount: '1',
  sender: '0xEVMSender1234567890abcdef1234567890abcdef',
  receiver: '0xEVMReceiver1234567890abcdef1234567890abcd',
  receiverProfile: {
    emoji: '🦍',
    name: 'EVM Account',
    color: '#9B59B6',
  },
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneHourAgo,
  type: 'nft',
  transferType: 'received',
  walletType: 'evm',
};

/**
 * NFT Sent - Multiple NFTs
 */
export const mockNftSentMultiple: ActivityItem = {
  id: 'mock-nft-sent-multiple',
  hash: '0x4567890123def0124567890123def0124567890123def0124567890123def012',
  title: 'Flovatar',
  token: 'Flovatar',
  image: 'https://flovatar.com/api/image/1234',
  amount: '5',
  sender: '0x1234567890abcdef',
  senderProfile: {
    emoji: '🎭',
    name: 'Collection',
    color: '#E74C3C',
  },
  receiver: '0xfriend12345678901',
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneDayAgo,
  type: 'nft',
  transferType: 'sent',
  walletType: 'flow',
};

/**
 * NFT Pending
 */
export const mockNftPending: ActivityItem = {
  id: 'mock-nft-pending',
  hash: '0x5678901234ef01235678901234ef01235678901234ef01235678901234ef0123',
  title: '.find Profile',
  token: 'FIND',
  image: 'https://find.xyz/api/nft/image/1234',
  amount: '1',
  sender: '0xsomeone12345678901',
  receiver: '0x1234567890abcdef',
  receiverProfile: {
    emoji: '🔍',
    name: 'Main Account',
    color: '#3498DB',
  },
  status: 'pending',
  error: false,
  indexed: false,
  time: now,
  type: 'nft',
  transferType: 'received',
  walletType: 'flow',
};

/**
 * NFT Failed
 */
export const mockNftFailed: ActivityItem = {
  id: 'mock-nft-failed',
  hash: '0x6789012345f012346789012345f012346789012345f012346789012345f01234',
  title: 'Flowverse Item',
  token: 'Flowverse',
  image: 'https://flowverse.co/nft/1234.png',
  amount: '1',
  sender: '0x1234567890abcdef',
  senderProfile: {
    emoji: '🌌',
    name: 'Gaming Account',
    color: '#1ABC9C',
  },
  receiver: '0xinvalidaddress123',
  status: 'failed',
  error: true,
  indexed: true,
  time: oneHourAgo,
  type: 'nft',
  transferType: 'sent',
  walletType: 'flow',
};

/**
 * FT Sent - FLOW
 */
export const mockFtSentFlow: ActivityItem = {
  id: 'mock-ft-sent-flow',
  hash: '0x789012345601234567890123456012345678901234560123456789012345601234',
  title: 'FLOW',
  token: 'FLOW',
  image: 'https://assets.coingecko.com/coins/images/13446/large/flow.png',
  amount: '100.50',
  sender: '0x1234567890abcdef',
  senderProfile: {
    emoji: '💰',
    name: 'Main Account',
    color: '#00EF8B',
  },
  receiver: '0xrecipient123456789',
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneHourAgo,
  type: 'ft',
  transferType: 'sent',
  walletType: 'flow',
};

/**
 * FT Received - FLOW
 */
export const mockFtReceivedFlow: ActivityItem = {
  id: 'mock-ft-received-flow',
  hash: '0x890123456701234568901234567012345689012345670123456890123456701234',
  title: 'FLOW',
  token: 'FLOW',
  image: 'https://assets.coingecko.com/coins/images/13446/large/flow.png',
  amount: '250.00',
  sender: '0xsender9876543210',
  receiver: '0x1234567890abcdef',
  receiverProfile: {
    emoji: '🌊',
    name: 'Savings',
    color: '#00EF8B',
  },
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneDayAgo,
  type: 'ft',
  transferType: 'received',
  walletType: 'flow',
};

/**
 * FT Sent - EVM (USDC)
 */
export const mockFtSentEvm: ActivityItem = {
  id: 'mock-ft-sent-evm',
  hash: '0x901234567801234569012345678012345690123456780123456901234567801234',
  title: 'USDC',
  token: 'USDC',
  image: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png',
  amount: '500.00',
  sender: '0xEVMSender1234567890abcdef1234567890abcdef',
  senderProfile: {
    emoji: '💵',
    name: 'EVM Account',
    color: '#2775CA',
  },
  receiver: '0xEVMRecipient1234567890abcdef1234567890ab',
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneHourAgo,
  type: 'ft',
  transferType: 'sent',
  walletType: 'evm',
};

/**
 * FT Received - EVM
 */
export const mockFtReceivedEvm: ActivityItem = {
  id: 'mock-ft-received-evm',
  hash: '0xa12345678901234570123456789012345701234567890123457012345678901234',
  title: 'WETH',
  token: 'WETH',
  image: 'https://assets.coingecko.com/coins/images/2518/large/weth.png',
  amount: '1.5',
  sender: '0xEVMSender9876543210fedcba9876543210fedcba',
  receiver: '0xEVMReceiver1234567890abcdef1234567890abcd',
  receiverProfile: {
    emoji: '⛽',
    name: 'EVM Account',
    color: '#627EEA',
  },
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneDayAgo,
  type: 'ft',
  transferType: 'received',
  walletType: 'evm',
};

/**
 * FT Pending
 */
export const mockFtPending: ActivityItem = {
  id: 'mock-ft-pending',
  hash: '0xb23456789012345681234567890123456812345678901234568123456789012345',
  title: 'FLOW',
  token: 'FLOW',
  image: 'https://assets.coingecko.com/coins/images/13446/large/flow.png',
  amount: '50.00',
  sender: '0x1234567890abcdef',
  senderProfile: {
    emoji: '⏳',
    name: 'Main Account',
    color: '#00EF8B',
  },
  receiver: '0xpending123456789012',
  status: 'pending',
  error: false,
  indexed: false,
  time: now,
  type: 'ft',
  transferType: 'sent',
  walletType: 'flow',
};

/**
 * FT Failed
 */
export const mockFtFailed: ActivityItem = {
  id: 'mock-ft-failed',
  hash: '0xc34567890123456792345678901234567923456789012345679234567890123456',
  title: 'FLOW',
  token: 'FLOW',
  image: 'https://assets.coingecko.com/coins/images/13446/large/flow.png',
  amount: '1000.00',
  sender: '0x1234567890abcdef',
  senderProfile: {
    emoji: '❌',
    name: 'Main Account',
    color: '#E74C3C',
  },
  receiver: '0xinvalidaddress123456',
  status: 'failed',
  error: true,
  indexed: true,
  time: oneHourAgo,
  type: 'ft',
  transferType: 'sent',
  walletType: 'flow',
};

/**
 * FT Expired
 */
export const mockFtExpired: ActivityItem = {
  id: 'mock-ft-expired',
  hash: '0xd45678901234567803456789012345678034567890123456780345678901234567',
  title: 'FLOW',
  token: 'FLOW',
  image: 'https://assets.coingecko.com/coins/images/13446/large/flow.png',
  amount: '25.00',
  sender: '0x1234567890abcdef',
  senderProfile: {
    emoji: '⌛',
    name: 'Main Account',
    color: '#95A5A6',
  },
  receiver: '0xexpiredtx123456789012',
  status: 'expired',
  error: false,
  indexed: true,
  time: oneDayAgo,
  type: 'ft',
  transferType: 'sent',
  walletType: 'flow',
};

/**
 * App Interaction
 */
export const mockInteraction: ActivityItem = {
  id: 'mock-interaction',
  hash: '0xe56789012345678914567890123456789145678901234567891456789012345678',
  title: 'NBA Top Shot',
  token: '',
  image: 'https://assets.nbatopshot.com/static/favicon.png',
  amount: '',
  sender: '0x1234567890abcdef',
  receiver: '0xcontract123456789012',
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneHourAgo,
  type: 'interaction',
  transferType: 'sent',
  walletType: 'flow',
};

/**
 * App Interaction - EVM
 */
export const mockInteractionEvm: ActivityItem = {
  id: 'mock-interaction-evm',
  hash: '0xf67890123456789025678901234567890256789012345678902567890123456789',
  title: 'Uniswap',
  token: '',
  image: 'https://app.uniswap.org/favicon.png',
  amount: '',
  sender: '0xEVMSender1234567890abcdef1234567890abcdef',
  receiver: '0xUniswapContract1234567890abcdef12345678',
  status: 'sealed',
  error: false,
  indexed: true,
  time: oneHourAgo,
  type: 'interaction',
  transferType: 'sent',
  walletType: 'evm',
};

/**
 * All mock items for easy iteration
 */
export const allMockActivityItems: { label: string; item: ActivityItem }[] = [
  { label: 'NFT Received (Flow)', item: mockNftReceivedFlow },
  { label: 'NFT Sent (Flow)', item: mockNftSentFlow },
  { label: 'NFT Received (EVM)', item: mockNftReceivedEvm },
  { label: 'NFT Sent Multiple (5 NFTs)', item: mockNftSentMultiple },
  { label: 'NFT Pending', item: mockNftPending },
  { label: 'NFT Failed', item: mockNftFailed },
  { label: 'FT Sent (FLOW)', item: mockFtSentFlow },
  { label: 'FT Received (FLOW)', item: mockFtReceivedFlow },
  { label: 'FT Sent (EVM - USDC)', item: mockFtSentEvm },
  { label: 'FT Received (EVM - WETH)', item: mockFtReceivedEvm },
  { label: 'FT Pending', item: mockFtPending },
  { label: 'FT Failed', item: mockFtFailed },
  { label: 'FT Expired', item: mockFtExpired },
  { label: 'App Interaction (Flow)', item: mockInteraction },
  { label: 'App Interaction (EVM)', item: mockInteractionEvm },
];
