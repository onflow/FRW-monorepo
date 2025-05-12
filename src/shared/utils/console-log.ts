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

const _consoleLog = (message: string, ...args: unknown[]) => {
  trackConsole('console_log', `${message} ${args.join(' ')}`);
};

const _consoleError = (message: string, ...args: unknown[]) => {
  trackConsole('console_error', `${message} ${args.join(' ')}`);
};

const _consoleWarn = (message: string, ...args: unknown[]) => {
  trackConsole('console_warn', `${message} ${args.join(' ')}`);
};

const _consoleDebug = (message: string, ...args: unknown[]) => {
  trackConsole('console_debug', `${message} ${args.join(' ')}`);
};

const _consoleTrace = (message: string, ...args: unknown[]) => {
  trackConsole('console_trace', `${message} ${args.join(' ')}`);
};

// Export the original console functions if not in production
export const consoleLog = IS_PROD ? _consoleLog : console.log; // eslint-disable-line no-console
export const consoleError = IS_PROD ? _consoleError : console.error;
export const consoleWarn = IS_PROD ? _consoleWarn : console.warn;
export const consoleDebug = IS_PROD ? _consoleDebug : console.debug; // eslint-disable-line no-console
export const consoleTrace = IS_PROD ? _consoleTrace : console.trace; // eslint-disable-line no-console
