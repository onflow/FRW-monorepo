import { BackupTipScreen } from '@onflow/frw-screens';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { usePlatform } from '@/bridge/PlatformContext';
import { STEPS } from '@/reducers';

const KeyRotationView: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { platform } = usePlatform();
  const address = new URLSearchParams(location.search).get('address') || '';
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStart = async () => {
    try {
      setIsGenerating(true);

      // Generate a new mnemonic and Flow key through the bridge
      // PlatformSpec extends KeyRotationDependencies, so createSeedKey is directly available
      // Using strength 128 (12 words) as default
      const newKeyInfo = await platform.createSeedKey(128);

      if (!newKeyInfo || !newKeyInfo.seedphrase) {
        throw new Error('Failed to generate mnemonic');
      }

      // Navigate to welcome/register page with the generated mnemonic
      navigate('/welcome/register', {
        state: {
          isFromKeyRotation: true,
          mnemonic: newKeyInfo.seedphrase,
          activeTab: STEPS.RECOVERY,
          address, // Pass the address for later use in the rotation process
          newKeyInfo, // Store the full key info for later use
        },
      });
    } catch (error) {
      console.error('Failed to generate key for rotation:', error);
      // TODO: Show error message to user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return <BackupTipScreen onContinue={handleStart} onBack={handleBack} />;
};

export default KeyRotationView;
