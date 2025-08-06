import CodePush from 'react-native-code-push';

export class UpdateService {
  static isUpdatesAvailable(): boolean {
    try {
      return CodePush && typeof CodePush.sync !== 'undefined';
    } catch (error) {
      console.warn('CodePush module not available:', error);
      return false;
    }
  }

  static async checkForUpdates(): Promise<boolean> {
    try {
      if (!this.isUpdatesAvailable()) {
        console.log('CodePush module not available');
        return false;
      }

      console.log('Checking for CodePush updates...');

      return new Promise(resolve => {
        CodePush.sync(
          {
            updateDialog: {
              title: 'Update Available',
              optionalUpdateMessage: 'A new update is available. Would you like to install it?',
              optionalInstallButtonLabel: 'Install',
              optionalIgnoreButtonLabel: 'Later',
            },
            installMode: CodePush.InstallMode.IMMEDIATE,
          },
          status => {
            console.log('CodePush sync status:', status);

            switch (status) {
              case CodePush.SyncStatus.UPDATE_INSTALLED:
                console.log('Update installed successfully');
                resolve(true);
                break;
              case CodePush.SyncStatus.UP_TO_DATE:
                console.log('App is up to date');
                resolve(false);
                break;
              case CodePush.SyncStatus.SYNC_IN_PROGRESS:
                console.log('Sync in progress...');
                break;
              case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                console.log('Checking for update...');
                break;
              case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                console.log('Downloading update...');
                break;
              case CodePush.SyncStatus.INSTALLING_UPDATE:
                console.log('Installing update...');
                break;
              case CodePush.SyncStatus.UNKNOWN_ERROR:
                console.log('Unknown error occurred');
                resolve(false);
                break;
              default:
                resolve(false);
                break;
            }
          },
          ({ receivedBytes, totalBytes }) => {
            console.log(`Download progress: ${receivedBytes}/${totalBytes}`);
          },
          error => {
            console.error('CodePush sync error:', error);
            resolve(false);
          }
        );
      });
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  static async reloadApp(): Promise<void> {
    try {
      if (!this.isUpdatesAvailable()) {
        console.log('CodePush module not available, cannot reload');
        return;
      }

      CodePush.restartApp();
    } catch (error) {
      console.error('Error reloading app:', error);
    }
  }

  static async getUpdateInfo() {
    try {
      if (!this.isUpdatesAvailable()) {
        return {
          isEnabled: false,
          updateId: null,
          createdAt: null,
          runtimeVersion: null,
        };
      }

      const metadata = await CodePush.getUpdateMetadata();

      return {
        isEnabled: true,
        updateId: metadata?.label || null,
        createdAt: metadata?.deploymentKey || null,
        runtimeVersion: metadata?.appVersion || null,
        packageHash: metadata?.packageHash || null,
      };
    } catch (error) {
      console.error('Error getting update info:', error);
      return {
        isEnabled: false,
        updateId: null,
        createdAt: null,
        runtimeVersion: null,
      };
    }
  }
}
