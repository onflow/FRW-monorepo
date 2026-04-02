import { Box } from '@mui/material';
import React, { useState } from 'react';

import AllSet from '@/ui/components/LandingPages/AllSet';
import LandingComponents from '@/ui/components/LandingPages/LandingComponents';
import { DEFAULT_PASSWORD } from '@/ui/utils/default-password';

import DecryptWallet from './DecryptWallet';
import EnterSeedPhrase from './EnterSeedPhrase';
import GoogleAccounts from './GoogleAccounts';
import GoogleRecoverPassword from './GoogleRecoverPassword';

const STEPS = {
  ACCOUNTS: 'accounts',
  DECRYPT: 'decrypt',
  ENTER_SEED_PHRASE: 'enter_seed_phrase',
  PASSWORD: 'password',
  ALL_SET: 'all_set',
} as const;

type StepType = (typeof STEPS)[keyof typeof STEPS];

interface AccountsState {
  accounts: string[];
}

interface GoogleProps {
  accounts: string[];
  onBack: () => void;
  flowType?: 'legacy' | 'workflow';
  isMultiBackup?: boolean;
  /** Only used when isMultiBackup=true. */
  multiBackupProvider?: 'google' | 'dropbox';
  /** Selected multi-backup sources (2-of-3): google, dropbox, seed. */
  multiBackupSources?: Array<'google' | 'dropbox' | 'seed'>;
}

const Google: React.FC<GoogleProps> = ({
  accounts,
  onBack,
  flowType = 'legacy',
  isMultiBackup = false,
  multiBackupProvider = 'google',
  multiBackupSources = [],
}) => {
  const [activeTab, setActiveTab] = useState<StepType>(STEPS.ACCOUNTS);
  const [mnemonic, setMnemonic] = useState('');
  const [verifiedSeedPhrase, setVerifiedSeedPhrase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(DEFAULT_PASSWORD);

  // Seed phrase is one independent multi-backup source; only verify if user selected it.
  const needsSeedVerify = isMultiBackup && multiBackupSources.includes('seed');
  const stepOrder: StepType[] = needsSeedVerify
    ? [STEPS.ACCOUNTS, STEPS.DECRYPT, STEPS.ENTER_SEED_PHRASE, STEPS.PASSWORD, STEPS.ALL_SET]
    : [STEPS.ACCOUNTS, STEPS.DECRYPT, STEPS.PASSWORD, STEPS.ALL_SET];

  const goBack = () => {
    switch (activeTab) {
      case STEPS.DECRYPT:
        setActiveTab(STEPS.ACCOUNTS);
        break;
      case STEPS.ENTER_SEED_PHRASE:
        setActiveTab(STEPS.DECRYPT);
        break;
      case STEPS.PASSWORD:
        setActiveTab(needsSeedVerify ? STEPS.ENTER_SEED_PHRASE : STEPS.DECRYPT);
        break;
      case STEPS.ALL_SET:
        setActiveTab(STEPS.PASSWORD);
        break;
      default:
        onBack();
    }
  };

  return (
    <LandingComponents
      activeIndex={Math.max(0, stepOrder.indexOf(activeTab))}
      direction="right"
      showBackButton={activeTab !== STEPS.ALL_SET}
      onBack={goBack}
      showConfetti={activeTab === STEPS.ALL_SET}
      showRegisterHeader={true}
    >
      <Box>
        {activeTab === STEPS.ACCOUNTS && (
          <GoogleAccounts
            handleSwitchTab={() => setActiveTab(STEPS.DECRYPT)}
            accounts={accounts}
            setUsername={setUsername}
          />
        )}

        {activeTab === STEPS.DECRYPT && (
          <DecryptWallet
            handleSwitchTab={() =>
              setActiveTab(needsSeedVerify ? STEPS.ENTER_SEED_PHRASE : STEPS.PASSWORD)
            }
            setMnemonic={setMnemonic}
            username={username}
            flowType={flowType}
            isMultiBackup={isMultiBackup}
            multiBackupProvider={multiBackupProvider}
            multiBackupSources={multiBackupSources}
            onDecryptedPassword={setPassword}
          />
        )}

        {needsSeedVerify && activeTab === STEPS.ENTER_SEED_PHRASE && (
          <EnterSeedPhrase
            mnemonicFromGoogle={mnemonic}
            onVerifiedPhrase={setVerifiedSeedPhrase}
            handleSwitchTab={() => setActiveTab(STEPS.PASSWORD)}
          />
        )}

        {activeTab === STEPS.PASSWORD && (
          <GoogleRecoverPassword
            handleSwitchTab={() => setActiveTab(STEPS.ALL_SET)}
            mnemonic={mnemonic}
            username={username}
            lastPassword={password}
          />
        )}

        {activeTab === STEPS.ALL_SET && <AllSet handleSwitchTab={() => window.close()} />}
      </Box>
    </LandingComponents>
  );
};

export default Google;
