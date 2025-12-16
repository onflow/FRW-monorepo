import { QueryProvider, InfoScreen, MigrationScreen } from '@onflow/frw-screens';
import React, { useState } from 'react';

import { LLHeader } from '@/ui/components';

const MigrationPage = () => {
  const [showMigration, setShowMigration] = useState(false);

  const handleStartMigration = () => {
    setShowMigration(true);
  };

  const handleBack = () => {
    if (showMigration) {
      setShowMigration(false);
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
          <MigrationScreen initialStage="in-progress" />
        ) : (
          <InfoScreen onStartMigration={handleStartMigration} />
        )}
      </QueryProvider>
    </div>
  );
};

export default MigrationPage;
