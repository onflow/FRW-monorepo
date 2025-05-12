import React, { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import type { Object } from 'ts-toolbelt';

import type { WalletController as WalletControllerClass } from 'background/controller/wallet';
import type { OpenApiService } from 'background/service/openapi';

import type { IExtractFromPromise } from '../../shared/utils/type';

export type WalletControllerType = {
  [key in keyof WalletControllerClass]: WalletControllerClass[key] extends (
    ...args: infer ARGS
  ) => infer RET
    ? <T extends IExtractFromPromise<RET> = IExtractFromPromise<RET>>(
        ...args: ARGS
      ) => Promise<IExtractFromPromise<T>>
    : WalletControllerClass[key];
};

export type WalletController = Object.Merge<
  WalletControllerClass,
  {
    openapi: {
      [key in keyof OpenApiService]: OpenApiService[key] extends (...args: infer ARGS) => infer RET
        ? <T extends IExtractFromPromise<RET> = IExtractFromPromise<RET>>(
            ...args: ARGS
          ) => Promise<IExtractFromPromise<T>>
        : OpenApiService[key];
    };
  }
>;

const WalletContext = createContext<{
  wallet: WalletController;
  loaded: boolean;
} | null>(null);

const WalletProvider = ({
  children,
  wallet,
}: {
  children?: ReactNode;
  wallet: WalletController;
}) => {
  const [walletInitialized, setWalletInitialized] = useState(false);

  useEffect(() => {
    const checkWalletInitialized = async () => {
      const walletInitialized = await wallet.isLoaded();
      if (walletInitialized) {
        setWalletInitialized(true);
      }
    };
    checkWalletInitialized();
  }, [wallet]);

  const walletInitializedListener = (
    msg: { type: string },
    _sender: unknown,
    _sendResponse: unknown
  ) => {
    if (msg.type === 'walletInitialized') {
      setWalletInitialized(true);
    }
  };
  useEffect(() => {
    let walletListener: typeof walletInitializedListener | null = null;
    if (!walletInitialized) {
      walletListener = walletInitializedListener;
      chrome.runtime.onMessage.addListener(walletListener);
    } else if (walletListener) {
      chrome.runtime.onMessage.removeListener(walletListener);
      walletListener = null;
    }
    return () => {
      if (walletListener) {
        chrome.runtime.onMessage.removeListener(walletListener);
        walletListener = null;
      }
    };
  }, [walletInitialized]);

  return (
    <WalletContext.Provider value={{ wallet, loaded: walletInitialized }}>
      {children}
    </WalletContext.Provider>
  );
};

const useWallet = () => {
  const { wallet } = useContext(WalletContext) as unknown as {
    wallet: WalletControllerType;
  };

  return wallet;
};

const useWalletLoaded = () => {
  const { loaded } = useContext(WalletContext) as unknown as {
    loaded: boolean;
  };

  return loaded;
};

export { WalletProvider, useWallet, useWalletLoaded };
