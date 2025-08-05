import { stripSensitive } from './strip-sensitive';

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

// Define the tracker function type
export type ConsoleTracker = (
  type: ConsoleMessageType,
  message: string,
  stack: string,
  code: number
) => void;

// Default tracker that does nothing
const defaultTracker: ConsoleTracker = () => {
  // No-op by default - consumers can set their own tracker
};

let replaceTracker: boolean = false;

// Allow custom tracker to be set
let customTracker: ConsoleTracker | null = null;

export const setConsoleTracker = (tracker: ConsoleTracker, replace: boolean) => {
  customTracker = tracker;
  replaceTracker = replace;
};

export const trackConsole = (type: ConsoleMessageType, message: string, code: number = 0) => {
  const sanitizedMessage = stripSensitive(message);
  const stack = getFormattedStackTrace();

  const tracker = customTracker || defaultTracker;
  tracker(type, sanitizedMessage, stack, code);
};

const _consoleLog = (...args: unknown[]) => {
  trackConsole('console_log', ` ${args.join(' ')}`);
};

const _consoleInfo = (...args: unknown[]) => {
  trackConsole('console_info', ` ${args.join(' ')}`);
};

const _consoleError = (...args: unknown[]) => {
  const stringArgs = args.map((arg) => {
    if (typeof arg === 'object') {
      return JSON.stringify(arg);
    }
    return arg?.toString() || 'undefined';
  });

  const sanitizedMessage = stripSensitive(stringArgs.join(' '));
  // eslint-disable-next-line no-console
  console.error(sanitizedMessage);
  try {
    trackConsole('console_error', sanitizedMessage);
  } catch {
    // ignore
    // eslint-disable-next-line no-console
    console.error('Could not track console error');
  }
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
export const consoleLog = replaceTracker ? _consoleLog : console.log; // eslint-disable-line no-console
export const consoleInfo = replaceTracker ? _consoleInfo : console.info; // eslint-disable-line no-console
export const consoleError = replaceTracker ? _consoleError : console.error; // eslint-disable-line no-console
export const consoleWarn = replaceTracker ? _consoleWarn : console.warn; // eslint-disable-line no-console
export const consoleDebug = replaceTracker ? _consoleDebug : console.debug; // eslint-disable-line no-console
export const consoleTrace = replaceTracker ? _consoleTrace : console.trace; // eslint-disable-line no-console
