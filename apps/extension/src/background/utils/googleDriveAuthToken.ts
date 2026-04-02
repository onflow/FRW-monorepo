/** Drive appdata only (legacy backup). Use this by default so we don't re-prompt users. */
export const SCOPE_DRIVE_APPDATA = 'https://www.googleapis.com/auth/drive.appdata';
/** Read My Drive. Only requested when user uses Multi Backup and file is not in appDataFolder. */
export const SCOPE_DRIVE_READONLY = 'https://www.googleapis.com/auth/drive.readonly';

/** Token for appDataFolder only. Use for legacy backup and initial Multi Backup lookup. */
export const getAuthTokenWrapper = async (interactive = true): Promise<string> => {
  return new Promise(function (resolve, reject) {
    chrome.identity.getAuthToken(
      { interactive, scopes: [SCOPE_DRIVE_APPDATA] },
      (token?: string) => (token ? resolve(token) : reject(token))
    );
  });
};

/** Token that includes Drive root read. Call only when loading Multi Backup from Drive root (e.g. mobile-created). */
export const getAuthTokenWrapperWithDriveReadonly = async (interactive = true): Promise<string> => {
  return new Promise(function (resolve, reject) {
    chrome.identity.getAuthToken(
      { interactive, scopes: [SCOPE_DRIVE_APPDATA, SCOPE_DRIVE_READONLY] },
      (token?: string) => (token ? resolve(token) : reject(token))
    );
  });
};
