/* eslint-disable @typescript-eslint/unified-signatures, @typescript-eslint/no-explicit-any */

/**
 * Available log levels.
 *
 * @public
 */
export enum LogLevel {
  // normal enum names
  Debug = 'debug',
  Error = 'error',
  Info = 'info',
  Warn = 'warn',
  // capital slack-style names
  DEBUG = 'debug',
  ERROR = 'error',
  INFO = 'info',
  WARN = 'warn',
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type LogParams = object;

/**
 * Log interface to fit console or bunyan.
 *
 * @public
 */
export interface Logger {

  child(options: any): Logger;

  debug(msg: string, ...params: Array<unknown>): void;
  debug(options: LogParams, msg: string, ...params: Array<unknown>): void;

  error(msg: string, ...params: Array<unknown>): void;
  error(err: Error, msg: string, ...params: Array<unknown>): void;
  error(options: LogParams, msg: string, ...params: Array<unknown>): void;

  info(msg: string, ...params: Array<unknown>): void;
  info(options: LogParams, msg: string, ...params: Array<unknown>): void;

  warn(msg: string, ...params: Array<unknown>): void;
  warn(options: LogParams, msg: string, ...params: Array<unknown>): void;
}

/**
 * Switch helper to invoke log methods based on variable log level. Dispatches a call to the appropriate log level
 * method.
 *
 * @public
 */
export function logWithLevel(logger: Logger, level: LogLevel, options: Error | LogParams, msg: string): void {
  switch (level) {
    case 'debug':
      logger.debug(options, msg);
      return;
    case 'info':
      logger.info(options, msg);
      return;
    case 'warn':
      logger.warn(options, msg);
      return;
    case 'error':
    default:
      logger.error(options, msg);
      return;
  }
}
