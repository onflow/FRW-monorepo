import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { LLHeader } from '@/ui/components/LLHeader';

import { ExtensionSelectTokens } from './ExtensionSelectTokens';

const SelectTokensScreenView = () => {
  const navigate = useNavigate();

  const handleTokenSelect = useCallback(() => {
    navigate('/dashboard/sendtoscreen');
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <>
      <LLHeader title="Select Token" help={false} />
      <ExtensionSelectTokens onTokenSelect={handleTokenSelect} onBack={handleBack} />
    </>
  );
};

export default SelectTokensScreenView;
