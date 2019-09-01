import { Logger } from './Logger';

/**
 * Logger implementation using the console.
 *
 * Works in the browser or node.
 *
 * @public
 */
export class ConsoleLogger implements Logger {
  /**
   * Global instance for users needing no customization.
   */
  public static readonly global = new ConsoleLogger();

  /**
   * Create a child logger.
   */
  public child(): Logger {
    return ConsoleLogger.global;
  }

  /* tslint:disable:no-console */

  /**
   * Log a message at debug level.
   */
  public debug(...params: Array<unknown>) {
    console.debug(...params);
  }

  /**
   * Log a message at info level.
   */
  public info(...params: Array<unknown>) {
    console.info(...params);
  }

  /**
   * Log a message at warning level.
   */
  public warn(...params: Array<unknown>) {
    console.warn(...params);
  }

  /**
   * Log a message at error level.
   *
   * Writes to stdout in node, appears as a red message in chrome, etc.
   */
  public error(...params: Array<unknown>) {
    console.error(...params);
  }
  /* tslint:enable:no-console */
}
