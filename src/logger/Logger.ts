export type LogLevel = 'debug' | 'error' | 'info' | 'warn';

/**
 * Log interface to fit console or bunyan.
 */
export interface Logger {
  child(options: any): Logger;

  debug(msg: string, ...params: Array<any>): void;
  debug(options: object, msg: string, ...params: Array<any>): void;

  error(msg: string, ...params: Array<any>): void;
  error(err: Error, msg: string, ...params: Array<any>): void;
  error(options: object, msg: string, ...params: Array<any>): void;

  info(msg: string, ...params: Array<any>): void;
  info(options: object, msg: string, ...params: Array<any>): void;

  warn(msg: string, ...params: Array<any>): void;
  warn(options: object, msg: string, ...params: Array<any>): void;
}

/**
 * Switch helper to invoke log methods based on variable log level.
 */
export function logWithLevel(logger: Logger, level: LogLevel, options: Error | object, msg: string) {
  switch (level) {
    case 'debug':
      return logger.debug(options, msg);
    case 'error':
      return logger.error(options, msg);
    case 'info':
      return logger.info(options, msg);
    case 'warn':
      return logger.warn(options, msg);
  }
}
