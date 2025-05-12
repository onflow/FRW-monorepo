const IS_PROD = process.env.NODE_ENV === 'production';

// Get the formatted stack trace
const getFormattedStackTrace = () => {
  const error = new Error();
  if (!error?.stack) {
    return "can't get stack trace";
  }

  const stack = error.stack
    .split('\n')
    .slice(2) // Remove the Error creation line and the getFormattedStackTrace function call
    .map((line) => line.trim())
    .join('\n');

  return stack;
};

export type ConsoleMessageType =
  | 'console_log'
  | 'console_info'
  | 'console_error'
  | 'console_warn'
  | 'console_debug'
  | 'console_trace';

export const trackConsole = (type: ConsoleMessageType, message: string, code: number = 0) => {
  chrome.runtime.sendMessage({
    type,
    message,
    stack: getFormattedStackTrace(),
    code,
  });
};

const _consoleLog = (...args: unknown[]) => {
  trackConsole('console_log', ` ${args.join(' ')}`);
};

const _consoleInfo = (...args: unknown[]) => {
  trackConsole('console_info', ` ${args.join(' ')}`);
};

const _consoleError = (...args: unknown[]) => {
  trackConsole('console_error', ` ${args.join(' ')}`);
};

const _consoleWarn = (...args: unknown[]) => {
  trackConsole('console_warn', ` ${args.join(' ')}`);
};

const _consoleDebug = (...args: unknown[]) => {
  trackConsole('console_debug', ` ${args.join(' ')}`);
};

const _consoleTrace = (...args: unknown[]) => {
  trackConsole('console_trace', ` ${args.join(' ')}`);
};

// Export the original console functions if not in production
export const consoleLog = IS_PROD ? _consoleLog : console.log; // eslint-disable-line no-console
export const consoleInfo = IS_PROD ? _consoleInfo : console.info; // eslint-disable-line no-console
export const consoleError = IS_PROD ? _consoleError : console.error;
export const consoleWarn = IS_PROD ? _consoleWarn : console.warn;
export const consoleDebug = IS_PROD ? _consoleDebug : console.debug; // eslint-disable-line no-console
export const consoleTrace = IS_PROD ? _consoleTrace : console.trace; // eslint-disable-line no-console
