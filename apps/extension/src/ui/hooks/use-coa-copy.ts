import { useState, useCallback } from 'react';

import { isValidEthereumAddress } from '@/shared/utils';

interface UseCOACopyResult {
  showModal: boolean;
  addressToCopy: string;
  handleCopy: (address: string, accountId?: number, accountName?: string) => void;
  handleConfirmCopy: (address: string) => void;
  closeModal: () => void;
}

/**
 * Hook to handle COA address copy with warning modal
 * @returns Object with modal state, handlers, and modal component
 */
export const useCOACopy = (): UseCOACopyResult => {
  const [showModal, setShowModal] = useState(false);
  const [addressToCopy, setAddressToCopy] = useState<string>('');

  const handleCopy = useCallback((addr: string, id?: number, name?: string) => {
    const isCOA = isValidEthereumAddress(addr) && !(id === 99 || name === 'EVM Account (EOA)');
    if (isCOA) {
      setAddressToCopy(addr);
      setShowModal(true);
    } else {
      navigator.clipboard.writeText(addr);
    }
  }, []);

  const handleConfirmCopy = useCallback((addr: string) => {
    navigator.clipboard.writeText(addr);
    setShowModal(false);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    showModal,
    addressToCopy,
    handleCopy,
    handleConfirmCopy,
    closeModal,
  };
};
