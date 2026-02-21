// Debug logger controlled by VITE_DEBUG environment variable
// Set VITE_DEBUG=true in .env.local to enable verbose logging

const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export const logger = {
  debug: (prefix: string, ...args: unknown[]): void => {
    if (DEBUG) console.log(prefix, ...args);
  },
  warn: (prefix: string, ...args: unknown[]): void => {
    if (DEBUG) console.warn(prefix, ...args);
  },
  // Errors are always logged regardless of debug flag
  error: (prefix: string, ...args: unknown[]): void => {
    console.error(prefix, ...args);
  },
};
