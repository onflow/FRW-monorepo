import CodePush from 'react-native-code-push';

export const checkForUpdate = async (): Promise<boolean> => {
  try {
    const update = await CodePush.checkForUpdate();
    return !!update;
  } catch (error) {
    console.error('Error checking for CodePush update:', error);
    return false;
  }
};

export const downloadAndInstallUpdate = async (): Promise<void> => {
  try {
    await CodePush.sync({
      installMode: 1, // ON_NEXT_RESTART
      updateDialog: {
        title: 'Update available',
        appendReleaseDescription: true,
        descriptionPrefix: '\n\nUpdate contents:\n',
        mandatoryContinueButtonLabel: 'Continue',
        mandatoryUpdateMessage: 'An update is available that must be installed.',
        optionalIgnoreButtonLabel: 'Later',
        optionalInstallButtonLabel: 'Install',
        optionalUpdateMessage: 'An update is available. Would you like to install it?',
      },
    });
  } catch (error) {
    console.error('Error downloading CodePush update:', error);
  }
};

export const getCurrentVersion = async (): Promise<string> => {
  try {
    const update = await CodePush.getUpdateMetadata();
    if (update) {
      return `${update.appVersion} (${update.label})`;
    }
    return 'Unknown';
  } catch (error) {
    console.error('Error getting CodePush version:', error);
    return 'Unknown';
  }
};
