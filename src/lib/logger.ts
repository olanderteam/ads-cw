/**
 * Centralized logger utility.
 *
 * - `logger.debug` and `logger.info` only emit in development (import.meta.env.DEV === true)
 * - `logger.error` always emits via console.error (for production error tracking)
 */
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },
  info: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};
