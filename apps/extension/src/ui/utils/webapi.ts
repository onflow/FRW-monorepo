export const getCurrentTab = async () => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  return tabs[0];
};

export const openInTab = async (url, needClose = true): Promise<number | undefined> => {
  const tab = await chrome.tabs.create({
    active: true,
    url,
  });

  if (needClose) window.close();

  return tab?.id;
};

export const getCurrentWindow = async (): Promise<number | undefined> => {
  const { id } = await chrome.windows.getCurrent({
    windowTypes: ['popup'],
  });

  return id;
};

export const openInternalPageInTab = (path: string, useWebapi = true) => {
  if (useWebapi) {
    openInTab(`./index.html#/${path}`);
  } else {
    window.open(`./index.html#/${path}`);
  }
};

export const openInternalPageInWindow = async (
  path: string,
  state?: Record<string, any>
): Promise<number | undefined> => {
  // Normalize path - remove leading slash if present to avoid double slashes
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

  // Build URL with query parameters directly in the URL (no storage)
  let url = `./index.html#/${normalizedPath}`;
  if (state && Object.keys(state).length > 0) {
    const params = new URLSearchParams();
    Object.entries(state).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }

  // Get current window position for positioning the new window
  const currentWindow = await chrome.windows.getCurrent();
  const BROWSER_HEADER = 80;
  const WINDOW_SIZE = {
    width: 400,
    height: 600,
  };

  const top = (currentWindow.top || 0) + BROWSER_HEADER;
  const left = (currentWindow.left || 0) + (currentWindow.width || 0) - WINDOW_SIZE.width;

  // Create a normal window (not popup)
  const win = await chrome.windows.create({
    focused: true,
    url,
    type: 'normal', // Use 'normal' instead of 'popup' for a full window
    top,
    left,
    width: WINDOW_SIZE.width,
    height: WINDOW_SIZE.height,
  });

  return win.id;
};
