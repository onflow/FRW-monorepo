import { clearLocalData } from '@onflow/frw-data-model';

import addressBookService from './addressBook';
import coinListService from './coinList';
import nftService from './nft';
import transactionActivityService from './transaction-activity';
import userInfoService from './user';
import userWalletService from './userWallet';

class StorageService {
  clearNFT = () => {
    nftService.clear();
  };

  clearNFTCollection = async () => {
    await nftService.clearNFTCollection();
  };

  clearCoinList = async () => {
    await coinListService.clear();
  };

  clearAllStorage = () => {
    nftService.clear();
    userInfoService.removeUserInfo();
    coinListService.clear();
    addressBookService.clear();
    userWalletService.clear();
    transactionActivityService.clear();
  };

  clearLocalStorage = async () => {
    await clearLocalData();
  };
}

export default new StorageService();
