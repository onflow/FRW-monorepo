import { getServiceContext } from '@onflow/frw-context';
import { type WalletType } from '@onflow/frw-types';

import { AddressBookService } from './AddressBookService';
import FlowService from './FlowService';
import { NFTService } from './NFTService';
import { ProfileService } from './ProfileService';
import { RecentRecipientsService } from './RecentRecipientsService';
import { TokenService } from './TokenService';

// Convenience functions for accessing services through context
export const flowService = (): FlowService => {
  const bridge = getServiceContext().bridge;
  return FlowService.getInstance(bridge);
};

export const addressBookService = (): AddressBookService => {
  const bridge = getServiceContext().bridge;
  return AddressBookService.getInstance(bridge);
};

export const recentRecipientsService = (): RecentRecipientsService => {
  const bridge = getServiceContext().bridge;
  return RecentRecipientsService.getInstance(bridge);
};

export const tokenService = (type: WalletType): TokenService => {
  const bridge = getServiceContext().bridge;
  return TokenService.getInstance(type, bridge);
};

export const nftService = (type: WalletType): NFTService => {
  const bridge = getServiceContext().bridge;
  return NFTService.getInstance(type, bridge);
};

export const profileService = (): ProfileService => {
  return ProfileService.getInstance();
};
