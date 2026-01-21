import { bridge } from '@onflow/frw-context';
import { QueryProvider, InfoScreen, MigrationScreen } from '@onflow/frw-screens';
import type { MigrationAssetsData } from '@onflow/frw-types';
import React, { useState } from 'react';

import { LLHeader } from '@/ui/components';


const MigrationPage = () => {
  const [showMigration, setShowMigration] = useState(false);
  const [migrationAssets, setMigrationAssets] = useState<MigrationAssetsData | undefined>(
    undefined
  );
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  const handleStartMigration = async () => {
    setIsLoadingAssets(true);
    try {
      // Get the source account (COA/EVM account) address
      const selectedAccount = await bridge.getSelectedAccount();
      const sourceAddress = selectedAccount?.address;

      if (!sourceAddress) {
        console.error('[MigrationPage] No source address available');
        setIsLoadingAssets(false);
        return;
      }

      console.log('[MigrationPage] Fetching migration assets for address:', sourceAddress);

      // Get migration assets from bridge
      if (bridge.getMigrationAssets) {
        const assets = await bridge.getMigrationAssets(sourceAddress);
        console.log('[MigrationPage] Migration assets fetched:', {
          erc20: assets.erc20.length,
          erc721: assets.erc721.length,
          erc1155: assets.erc1155.length,
        });
        setMigrationAssets(assets);
      } else {
        console.warn('[MigrationPage] getMigrationAssets not available on bridge');
      }
    } catch (error) {
      console.error('[MigrationPage] Failed to fetch migration assets:', error);
    } finally {
      setIsLoadingAssets(false);
      setShowMigration(true);
    }
  };

  const handleBack = () => {
    if (showMigration) {
      setShowMigration(false);
      setMigrationAssets(undefined);
    }
  };

  return (
    <div className="page">
      {!showMigration && (
        <LLHeader
          title={chrome.i18n.getMessage('Migration') || 'Migration'}
          help={false}
          goBackLink="/dashboard/setting"
        />
      )}
      <QueryProvider>
        {showMigration ? (
          <MigrationScreen initialStage="ready" assets={migrationAssets} />
        ) : (
          <InfoScreen onStartMigration={handleStartMigration} />
        )}
      </QueryProvider>
    </div>
  );
};

export default MigrationPage;
