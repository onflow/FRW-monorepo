export const getAuthTokenWrapper = async (interactive = true): Promise<string> => {
  return new Promise(function (resolve, reject) {
    const detail = {
      interactive: interactive,
      scopes: ['https://www.googleapis.com/auth/drive.appdata'],
    };
    chrome.identity.getAuthToken(detail, (token?: string) => {
      if (token) {
        resolve(token);
      } else {
        reject(token);
      }
    });
  });
};
