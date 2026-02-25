import { Box, Tab, Tabs, Typography } from '@mui/material';
import { generateRandomUsername } from '@onflow/frw-utils';
import React, { useEffect, useState } from 'react';

import { type PublicKeyAccount } from '@/shared/types';
import { QrCodeIcon } from '@/ui/assets/icons/QrCodeIcon';
import Googledrive from '@/ui/components/import-components/Googledrive';
import JsonImport from '@/ui/components/import-components/JsonImport';
import KeyImport from '@/ui/components/import-components/KeyImport';
import MobileAppImportSteps from '@/ui/components/import-components/mobile-app-import-steps';
import MultiBackupConnect from '@/ui/components/import-components/MultiBackupConnect';
import SeedPhraseImport from '@/ui/components/import-components/SeedPhraseImport';
import ErrorModel from '@/ui/components/PopupModal/errorModel';
import { useWallet } from '@/ui/hooks/use-wallet';
import {
  COLOR_GREEN_FLOW_DARKMODE_00EF8B,
  COLOR_GREEN_FLOW_DARKMODE_00EF8B_10pc,
} from '@/ui/style/color';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{children}</Box>}
    </div>
  );
}

const ImportTabs = ({
  setMnemonic,
  setPk,
  setAccounts,
  pk,
  mnemonic,
  goPassword,
  handleSwitchTab,
  setErrorMessage,
  setShowError,
  handleBackupAccountsFound,
  path,
  setPath,
  phrase,
  setPhrase,
  onRegisterNewProfile,
}: {
  setMnemonic: (mnemonic: string) => void;
  setPk: (pk: string) => void;
  setAccounts: (accounts: PublicKeyAccount[]) => void;
  pk: string | null;
  mnemonic: string | null;
  goPassword: () => void;
  handleSwitchTab: () => void;
  setErrorMessage: (errorMessage: string) => void;
  setShowError: (showError: boolean) => void;
  handleBackupAccountsFound: (
    accounts: string[],
    flow:
      | { kind: 'legacy_google' }
      | { kind: 'multi_backup'; sources: Array<'google' | 'dropbox' | 'seed'> }
  ) => void;
  path: string;
  setPath: (path: string) => void;
  phrase: string;
  setPhrase: (phrase: string) => void;
  onRegisterNewProfile?: (data: {
    importData: any;
    username: string;
    isFromImport: boolean;
  }) => void;
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isSignLoading, setSignLoading] = useState(false);
  const [newKey, setKeyNew] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [keystoreJson, setKeystoreJson] = useState<string>('');
  const [gdDebug, setGdDebug] = useState<{
    config: {
      defaultBackupName: string;
      multiBackupName: string;
      multiBackupId: string;
    } | null;
    fileNames: string[] | null;
    filesWithIds: { id: string; name: string }[] | null;
    error: string | null;
  }>({ config: null, fileNames: null, filesWithIds: null, error: null });
  const usewallet = useWallet();

  useEffect(() => {
    const checkIsBooted = async () => {
      const isBooted = await usewallet.isBooted();
      setIsLogin(isBooted);
    };
    checkIsBooted();
  }, [usewallet]);

  useEffect(() => {
    if (selectedTab !== 0 && selectedTab !== 1) {
      setGdDebug({ config: null, fileNames: null, filesWithIds: null, error: null });
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const [config, filesWithIds] = await Promise.all([
          usewallet.getGoogleDriveBackupConfigForDebug(),
          usewallet
            .listGoogleDriveAppDataFilesForDebug()
            .catch(() => [] as { id: string; name: string }[]),
        ]);
        const fileNames = filesWithIds.map((f) => f.name);
        if (!cancelled) {
          setGdDebug({ config, fileNames, filesWithIds, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setGdDebug({
            config: null,
            fileNames: null,
            filesWithIds: null,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedTab, usewallet]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleImport = async (accounts: PublicKeyAccount[]) => {
    if (!accounts || accounts.length === 0) {
      console.error('No accounts provided to handleImport');
      setErrorMessage('No accounts found. Please check your input and try again.');
      setShowError(true);
      return;
    }

    setAccounts(accounts);

    try {
      const result = await usewallet.openapi.checkImport(accounts[0].publicKey);
      if (result.status === 409) {
        // The account has been previously imported, so just retrieve the current user name
        goPassword();
      } else {
        // The key has never been imported before, we need to set a username and confirm / create a password
        if (!accounts[0].address) {
          // No account found - directly navigate to register flow
          handleRegisterNewProfile();
          return;
        }
        handleSwitchTab();
      }
    } catch (error) {
      setErrorMessage('Error checking account import status. Please try again.');
      setShowError(true);
    }
  };

  const handleRegisterNewProfile = () => {
    // Generate random username (same as register flow)
    const autoUsername = generateRandomUsername();

    // Pass the import data and auto username to register page
    let importData: any = null;

    if (selectedTab === 3) {
      // Recovery Phrase tab

      importData = {
        type: 'mnemonic',
        mnemonic: mnemonic || '', // Use the actual mnemonic seed phrase
        path: path,
        passphrase: phrase, // This is the BIP39 passphrase
      };
    } else if (selectedTab === 4) {
      // Private Key tab

      importData = {
        type: 'privateKey',
        privateKey: pk || '',
      };
    } else if (selectedTab === 2) {
      // Keystore tab

      importData = {
        type: 'privateKey',
        privateKey: pk || '',
      };
    }

    onRegisterNewProfile?.({
      importData,
      username: autoUsername,
      isFromImport: true,
    });
  };

  const sxStyles = {
    fontFamily: 'Inter',
    fontSize: '14px',
    fontStyle: 'normal',
    fontWeight: 600,
    padding: '0px 16px',
    lineHeight: '120%',
    letterSpacing: '-0.6%',
    textTransform: 'none',
  };

  return (
    <Box sx={{ padding: '0 16px 16px' }}>
      <Box sx={{ padding: '20px 24px' }}>
        <Typography variant="h4">{chrome.i18n.getMessage('Import__Profile')}</Typography>
        <Typography variant="body1" color="text.secondary">
          {chrome.i18n.getMessage('Import_Profile_Subtitle')}
        </Typography>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        aria-label="simple tabs example"
        sx={{
          padding: '0px 24px',
          '& .Mui-selected': {
            borderRadius: '16px',
            color: COLOR_GREEN_FLOW_DARKMODE_00EF8B,
            background: COLOR_GREEN_FLOW_DARKMODE_00EF8B_10pc,
            border: 'none',
          },
          '& .MuiTab-root': {
            minHeight: '12px',
            padding: '12px 10px',
          },
          '& .MuiTabs-indicator': {
            background: 'transparent',
          },
          '& .MuiTabs-flexContainer': {
            gap: '12px',
          },
        }}
        textColor="primary"
      >
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Google__Drive')} />
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Multi_Backup')} />
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Keystore')} />
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Recovery_Phrase')} />
        <Tab sx={sxStyles} label={chrome.i18n.getMessage('Private_Key')} />
        <Tab
          sx={{
            ...sxStyles,
            justifyContent: 'flex-end',
            marginLeft: 'auto',
            padding: '0px',
            gap: '10px',
          }}
          label={chrome.i18n.getMessage('Mobile_app')}
          icon={<QrCodeIcon />}
          iconPosition="start"
        />
      </Tabs>
      <TabPanel value={selectedTab} index={0}>
        <Googledrive
          setErrorMessage={setErrorMessage}
          setShowError={setShowError}
          handleBackupAccountsFound={handleBackupAccountsFound}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <MultiBackupConnect
          setErrorMessage={setErrorMessage}
          setShowError={setShowError}
          handleBackupAccountsFound={handleBackupAccountsFound}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        <JsonImport
          onOpen={handleRegisterNewProfile}
          onImport={handleImport}
          setPk={setPk}
          isSignLoading={isSignLoading}
          initialJson={keystoreJson}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={3}>
        <SeedPhraseImport
          onOpen={handleRegisterNewProfile}
          onImport={handleImport}
          setMnemonic={setMnemonic}
          isSignLoading={isSignLoading}
          path={path}
          setPath={setPath}
          phrase={phrase}
          setPhrase={setPhrase}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={4}>
        <KeyImport
          onOpen={handleRegisterNewProfile}
          onImport={handleImport}
          setPk={setPk}
          isSignLoading={isSignLoading}
          onSwitchToKeystoreTab={() => setSelectedTab(2)}
          onSetKeystoreJson={(json) => setKeystoreJson(json)}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={5}>
        <MobileAppImportSteps isLogin={isLogin} />
      </TabPanel>
      {(selectedTab === 0 || selectedTab === 1) && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Google Drive debug
          </Typography>
          {gdDebug.error && (
            <Typography variant="caption" display="block" color="error" sx={{ mt: 0.5 }}>
              {gdDebug.error}
            </Typography>
          )}
          {gdDebug.config && (
            <Typography variant="caption" component="div" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
              Legacy (Google Drive tab): first file named "
              {gdDebug.config.defaultBackupName || '(not set)'}" (no id)
              <br />
              Multi Backup tab:{' '}
              {gdDebug.config.multiBackupId
                ? `id: ${gdDebug.config.multiBackupId}`
                : `name "${gdDebug.config.multiBackupName || '(not set)'}" or, when two files share the legacy name, the second file. Set GD_MULTI_BACKUP_ID to force a specific file.`}
            </Typography>
          )}
          {gdDebug.filesWithIds && gdDebug.filesWithIds.length > 0 && (
            <Typography variant="caption" component="div" sx={{ mt: 0.5, fontFamily: 'monospace' }}>
              Files in app data folder:
              {gdDebug.filesWithIds.map((f, i) => {
                const defaultName = gdDebug.config?.defaultBackupName ?? '';
                const sameNameIndices = gdDebug
                  .filesWithIds!.map((x, idx) => (x.name === defaultName ? idx : -1))
                  .filter((idx) => idx >= 0);
                const isFirstWithLegacyName =
                  defaultName && f.name === defaultName && sameNameIndices[0] === i;
                const isSecondWithLegacyName =
                  defaultName &&
                  sameNameIndices.length >= 2 &&
                  f.name === defaultName &&
                  sameNameIndices[1] === i;
                const legacyHint = isFirstWithLegacyName ? ' ← Legacy uses this' : '';
                const multiHint =
                  isSecondWithLegacyName ||
                  (gdDebug.config?.multiBackupId && f.id === gdDebug.config.multiBackupId)
                    ? ' ← Multi Backup uses this'
                    : '';
                return (
                  <Box key={f.id} component="span" display="block" sx={{ ml: 1 }}>
                    • [{i + 1}] name: "{f.name}" → id: {f.id}
                    {legacyHint}
                    {multiHint}
                  </Box>
                );
              })}
            </Typography>
          )}
          {gdDebug.filesWithIds && gdDebug.filesWithIds.length === 0 && !gdDebug.error && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              No files in app data folder (or not signed in to Google)
            </Typography>
          )}
        </Box>
      )}
      {!newKey && (
        <ErrorModel
          isOpen={!newKey}
          onOpenChange={setKeyNew}
          errorName={chrome.i18n.getMessage('Publickey_already_exist')}
          errorMessage={chrome.i18n.getMessage('Please_import_or_register_a_new_key')}
          isGoback={true}
        />
      )}
    </Box>
  );
};

export default ImportTabs;
