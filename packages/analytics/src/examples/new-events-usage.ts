/**
 * Example usage of the new tracking events
 *
 * This example demonstrates how to use:
 * - Navigation tracking (tabs, primary actions)
 * - Web tracking (app authentication, site visits)
 * - Backup tracking (recovery phrase, device, cloud backups)
 */
import { createConsoleAnalytics, NavigationTracker, WebTracker, BackupTracker } from '../index.js';

async function demonstrateNewTrackingEvents() {
  // Create analytics instance
  const analytics = await createConsoleAnalytics({ debug: true });

  // ===========================================
  // NAVIGATION TRACKING
  // ===========================================
  console.log('=== Navigation Tracking Examples ===');

  const navigationTracker = new NavigationTracker(analytics);

  // Track tab navigation
  await navigationTracker.trackTabOpened({ tab: 'dashboard' });
  await navigationTracker.trackDashboardOpened(); // convenience method

  // Track primary actions
  await navigationTracker.trackPrimaryActionSelected({ action: 'send' });
  await navigationTracker.trackSendActionSelected(); // convenience method

  // Using tab session for more complex navigation tracking
  const tabSession = navigationTracker.createTabSession('dashboard');

  await tabSession.switchTab('explore');
  await tabSession.primaryActionSelected('buy');
  await tabSession.switchTab('settings');

  console.log('Tab history:', tabSession.getTabHistory());
  console.log('Unique tabs visited:', tabSession.getUniqueTabsVisited());

  // ===========================================
  // WEB TRACKING
  // ===========================================
  console.log('\n=== Web Tracking Examples ===');

  const webTracker = new WebTracker(analytics);

  // Track app authentication
  await webTracker.trackAppAuthenticated({
    url: 'https://www.kittypunch.xyz',
    address: '0x123abc...',
  });

  // Track site visits
  await webTracker.trackSiteVisited({
    url: 'https://www.kittypunch.xyz',
  });

  // Using browser session for comprehensive tracking
  const browserSession = webTracker.createBrowserSession();

  await browserSession.visitSite('https://www.kittypunch.xyz');
  await browserSession.authenticateApp('https://www.kittypunch.xyz', '0x123abc...');
  await browserSession.visitSite('https://www.flowverse.co');

  console.log('Browser session summary:', {
    duration: browserSession.getDuration(),
    uniqueSites: browserSession.getUniqueSitesVisited(),
    totalTimeSpent: browserSession.getTotalTimeSpent(),
  });

  // Using authentication session for app-specific tracking
  const authSession = webTracker.createAuthenticationSession('0x123abc...');

  await authSession.authenticateWithApp('https://www.kittypunch.xyz');
  await authSession.visitSite('https://www.kittypunch.xyz/game');
  await authSession.authenticateWithApp('https://www.flowverse.co');

  console.log('Authentication summary:', {
    address: authSession.getAddress(),
    uniqueApps: authSession.getUniqueAppsAuthenticated(),
    successfulAuths: authSession.getSuccessfulAuthentications(),
  });

  // ===========================================
  // BACKUP TRACKING
  // ===========================================
  console.log('\n=== Backup Tracking Examples ===');

  const backupTracker = new BackupTracker(analytics);
  const userAddress = '0x456def...';

  // Track individual backup events
  await backupTracker.trackRecoveryPhraseBackupCreated({
    address: userAddress,
    platform: 'iOS',
  });

  await backupTracker.trackDeviceBackupCreated({
    address: userAddress,
    platform: 'iOS',
  });

  await backupTracker.trackCloudBackupCreated({
    address: userAddress,
    platform: 'iOS',
    providers: ['iCloud'],
  });

  // Using convenience methods
  await backupTracker.trackiOSRecoveryPhraseBackup(userAddress);
  await backupTracker.trackGoogleDriveBackup(userAddress, ['GoogleDrive']);

  // Using backup session for comprehensive backup flow
  const backupSession = backupTracker.createBackupSession(userAddress, 'iOS');

  await backupSession.recoveryPhraseBackupCompleted();
  await backupSession.deviceBackupCompleted();
  await backupSession.cloudBackupCompleted(['iCloud']);

  console.log('Backup session summary:', {
    address: backupSession.getAddress(),
    platform: backupSession.getPlatform(),
    completedBackups: backupSession.getCompletedBackupTypes(),
    hasAllBackups: backupSession.hasCompletedAllBackups(),
  });

  // Using multi-backup session for cross-platform backup tracking
  const multiBackupSession = backupTracker.createMultiBackupSession(userAddress);

  // iOS backups
  await multiBackupSession.createPlatformBackup('iOS', 'recovery_phrase');
  await multiBackupSession.createPlatformBackup('iOS', 'device');
  await multiBackupSession.createPlatformBackup('iOS', 'cloud', ['iCloud']);

  // Android backups
  await multiBackupSession.createPlatformBackup('Android', 'recovery_phrase');
  await multiBackupSession.createPlatformBackup('Android', 'cloud', ['GoogleDrive']);

  // Extension backup
  await multiBackupSession.createPlatformBackup('Extension', 'recovery_phrase');

  console.log('Multi-backup session summary:', multiBackupSession.getBackupSummary());

  // ===========================================
  // COMBINED USAGE SCENARIOS
  // ===========================================
  console.log('\n=== Combined Usage Scenarios ===');

  // Scenario: User opens app, navigates to settings, creates backup
  await navigationTracker.trackAppOpened({ source: 'direct', coldStart: true });
  await navigationTracker.trackTabOpened({ tab: 'settings' });

  const settingsBackupSession = backupTracker.createBackupSession(userAddress, 'Extension');
  await settingsBackupSession.recoveryPhraseBackupCompleted();

  // Scenario: User browses dApps and authenticates
  const dappSession = webTracker.createBrowserSession();
  await dappSession.visitSite('https://www.flowverse.co');
  await dappSession.authenticateApp('https://www.flowverse.co', userAddress);

  // Track primary action after authentication
  await navigationTracker.trackPrimaryActionSelected({ action: 'swap' });

  console.log('\n=== New Tracking Events Examples Complete ===');
}

// Export for potential usage
export { demonstrateNewTrackingEvents };

// Run example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateNewTrackingEvents().catch(console.error);
}
