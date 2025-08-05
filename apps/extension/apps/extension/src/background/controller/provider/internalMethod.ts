import { keyringService, preferenceService } from '@/core/service';

const tabCheckin = ({
  data: {
    params: { origin, name, icon },
  },
  session,
}) => {
  session.setProp({ origin, name, icon });
};

const getProviderState = async (req) => {
  const {
    session: { origin },
  } = req;

  // const chainEnum = permissionService.getWithoutUpdate(origin)?.chain;
  const isUnlocked = keyringService.isUnlocked;

  return {
    chainId: 'ETH',
    isUnlocked,
    // accounts: isUnlocked ? await providerController.ethAccounts(req) : [],
    accounts: [],
    // networkVersion: await providerController.netVersion(req),
    networkVersion: [],
  };
};

const providerOverwrite = ({
  data: {
    params: [val],
  },
}) => {
  preferenceService.setHasOtherProvider(val);
  return true;
};

const hasOtherProvider = () => {
  preferenceService.setHasOtherProvider(true);
  return true;
};

const isDefaultWallet = () => {
  return preferenceService.getIsDefaultWallet();
};

export default {
  tabCheckin,
  getProviderState,
  providerOverwrite,
  hasOtherProvider,
  isDefaultWallet,
};
