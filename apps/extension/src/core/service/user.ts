import { setUserInSentry } from '@/background/sentry';
import {
  userInfoCachekey,
  userInfoRefreshRegex,
  type UserInfoStore,
  getValidData,
  registerRefreshListener,
  setCachedData,
  getLocalData,
  setLocalData,
} from '@/data-model';
import { type UserInfoResponse, type LoggedInAccount } from '@/shared/types';
import { consoleError } from '@/shared/utils';

import openapiService from './openapi';
import userWalletService from './userWallet';
import { getCurrentProfileId, returnCurrentProfileId } from '../utils/current-id';
import createSessionStore from '../utils/persistStore';

const storedUserListKey = 'stored-user-list';
const loggedInAccountsKey = 'loggedInAccounts';

class UserInfoService {
  store!: Map<string, UserInfoResponse>;
  private userList: UserInfoResponse[] = [];
  // TODO: remove this
  dashboardIndex = 0;
  init = async () => {
    this.store = new Map<string, UserInfoResponse>();
    this.userList = await this.loadStoredUserList();
    registerRefreshListener(userInfoRefreshRegex, this.loadUserInfoByUserId);
  };

  getUserList = (): UserInfoResponse[] => {
    return structuredClone(this.userList);
  };

  loadStoredUserList = async (): Promise<UserInfoResponse[]> => {
    const userList = await getLocalData<UserInfoResponse[]>(storedUserListKey);
    if (!userList) {
      // Translate from logged in accounts
      return await this.translateFromLoggedInAccounts();
    }
    return userList;
  };

  translateFromLoggedInAccounts = async (): Promise<UserInfoResponse[]> => {
    const loggedInAccounts = await getLocalData<LoggedInAccount[]>(loggedInAccountsKey);
    if (!loggedInAccounts) {
      return [];
    }
    return loggedInAccounts.map((account) => {
      const userInfo: UserInfoResponse = {
        id: account.id,
        username: account.username,
        avatar: account.avatar,
        nickname: account.nickname,
        private: account.private,
        created: account.created,
      };
      return userInfo;
    });
  };
  loadUserInfoByUserId = async (userId: string) => {
    const currentId = await returnCurrentProfileId();

    const userInfo: UserInfoResponse | undefined =
      currentId === userId
        ? // Great we have permission to get the user info
          // As we're logged in as the user
          await this.fetchUserInfo()
        : // Try to find the user in the list of stored users
          this.userList.find((user) => user.id === userId);

    if (userInfo) {
      setCachedData(userInfoCachekey(userId), userInfo);
    }
    return userInfo;
  };

  getUserInfo = async (userId: string): Promise<UserInfoResponse | undefined> => {
    const userInfo = await getValidData<UserInfoStore>(userInfoCachekey(userId));
    if (!userInfo) {
      return await this.loadUserInfoByUserId(userId);
    }

    return userInfo;
  };
  updateUserInfo = async (nickname: string, avatar: string) => {
    const res = await openapiService.updateProfile(nickname, avatar);
    // Refresh the user info
    if (res.status === 200) {
      const currentId = await getCurrentProfileId();
      const userInfo = await this.loadUserInfoByUserId(currentId);
      return userInfo;
    }

    throw new Error('Failed to update user info');
  };
  getCurrentUserInfo = async (): Promise<UserInfoResponse> => {
    const currentId = await getCurrentProfileId();
    const userInfo = await this.getUserInfo(currentId);
    if (!userInfo) {
      throw new Error('User info not found');
    }

    return userInfo;
  };

  setCurrentUserInfo = async (userInfo: UserInfoResponse) => {
    const currentId = await getCurrentProfileId();

    const userInfoWithAvatar: UserInfoResponse = { ...userInfo };

    if (this.store[currentId]) {
      // Assign so that it maintains the reference
      Object.assign(this.store[currentId], userInfoWithAvatar);
    } else {
      // Create a new session store
      this.store[currentId] = createSessionStore<UserInfoStore>({
        name: userInfoCachekey(currentId),
        template: userInfoWithAvatar,
      });
    }

    // As we can't get the list of users easily we need to cache this list in persistent storage
    const userIndex = this.userList.findIndex((user) => user.id === currentId);
    if (userIndex === -1) {
      this.userList.push(userInfoWithAvatar);
    } else {
      this.userList[userIndex] = userInfoWithAvatar;
    }
    await setLocalData(storedUserListKey, this.userList);

    // Update Sentry user context with comprehensive wallet info
    try {
      const currentAddress = await userWalletService.getCurrentAddress();
      const parentAccount = await userWalletService.getParentAccount();
      const evmAccount = await userWalletService.getEvmAccount();
      const network = userWalletService.getNetwork();
      const accountType = await userWalletService.getActiveAccountType();

      // Get app version from manifest
      const manifest = chrome.runtime.getManifest();

      // Get EOA address if available
      let eoaAddress: string | undefined;
      try {
        const eoaInfo = await userWalletService.getMainAccounts();
        eoaAddress = eoaInfo[0]?.eoaAccount?.address;
      } catch (error) {
        // EOA might not be available, silently continue
      }

      setUserInSentry({
        uid: currentId,
        username: userInfoWithAvatar.username,
        flowAddress: parentAccount?.address || undefined,
        coaAddress: evmAccount?.address || undefined,
        eoaAddress: eoaAddress,
        selectedAccount: accountType || 'unknown',
        network: network,
        version: manifest.version,
      });
    } catch (error) {
      // Silently fail - don't break user info update if Sentry update fails
      consoleError('Failed to update Sentry user context:', error);
    }
  };

  fetchUserInfo = async (): Promise<UserInfoResponse> => {
    const info = await openapiService.userInfo();
    if (info && info?.avatar) {
      const avatar = this.addTokenForFirebaseImage(info?.avatar);
      const updatedUrl = this.replaceAvatarUrl(avatar);
      info.avatar = updatedUrl;
      this.setCurrentUserInfo(info);
    }
    return info;
  };

  replaceAvatarUrl = (url) => {
    const baseUrl = 'https://source.boringavatars.com/';
    const newBaseUrl = 'https://lilico.app/api/avatar/';

    if (url.startsWith(baseUrl)) {
      return url.replace(baseUrl, newBaseUrl);
    }

    return url;
  };

  addTokenForFirebaseImage = (avatar: string): string => {
    if (!avatar) {
      return avatar;
    }
    try {
      const url = new URL(avatar);
      if (url.host === 'firebasestorage.googleapis.com') {
        url.searchParams.append('alt', 'media');
        return url.toString();
      }
      return avatar;
    } catch (err) {
      consoleError(err);
      return avatar;
    }
  };
  removeUserInfo = () => {
    // Note this removes the linkage to the store...
    this.store = new Map<string, UserInfoResponse>();
  };

  // Todo remove this...
  setDashIndex = (data: number) => {
    this.dashboardIndex = data;
  };

  getDashIndex = () => {
    return this.dashboardIndex;
  };
}

export default new UserInfoService();
