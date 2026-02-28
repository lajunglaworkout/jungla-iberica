/**
 * SEC-05: Development-only logging utility
 * Wraps console.log/warn/error to prevent debug information
 * from appearing in production builds.
 * 
 * Usage: import { devLog, devWarn, devError } from '../utils/devLogger';
 *        devLog('Debug info:', data);
 */

const isDev = import.meta.env.DEV;

export const devLog = (...args: unknown[]) => {
    if (isDev) console.log(...args);
};

export const devWarn = (...args: unknown[]) => {
    if (isDev) console.warn(...args);
};

export const devError = (...args: unknown[]) => {
    // Errors are always logged (useful for production debugging)
    console.error(...args);
};

export const devGroup = (label: string) => {
    if (isDev) console.group(label);
};

export const devGroupEnd = () => {
    if (isDev) console.groupEnd();
};

export default { devLog, devWarn, devError, devGroup, devGroupEnd };
