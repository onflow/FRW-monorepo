// Simple console passthroughs so Sentry can hook native console APIs
export const consoleLog = (...args: unknown[]) => console.log(...args); // eslint-disable-line no-console
export const consoleInfo = (...args: unknown[]) => console.info(...args); // eslint-disable-line no-console
export const consoleError = (...args: unknown[]) => console.error(...args); // eslint-disable-line no-console
export const consoleWarn = (...args: unknown[]) => console.warn(...args); // eslint-disable-line no-console
export const consoleDebug = (...args: unknown[]) => console.debug(...args); // eslint-disable-line no-console
export const consoleTrace = (...args: unknown[]) => console.trace(...args); // eslint-disable-line no-console
