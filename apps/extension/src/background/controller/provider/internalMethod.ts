import { keyringService, preferenceService } from '@/core/service';

import providerController from './controller';

const tabCheckin = ({
  data: {
    params: { name, icon },
  },
  session,
}) => {
  // Ignore claimed origin from page payload; origin is bound from sender URL in background/index.ts.
  session.setProp({ origin: session.origin, name, icon });
};

const getProviderState = async (req) => {
  const {
    session: { origin },
  } = req;

  // const chainEnum = permissionService.getWithoutUpdate(origin)?.chain;
  const isUnlocked = keyringService.isUnlocked();

  return {
    chainId: await providerController.ethChainId(req),
    isUnlocked,
    accounts: isUnlocked ? await providerController.ethAccounts(req) : [],
    // accounts: [],
    networkVersion: await providerController.netVersion(),
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
