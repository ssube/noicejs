import { Logger } from './Logger';

/**
 * Logger implementation using the console.
 */
export class ConsoleLogger implements Logger {
  public static readonly global = new ConsoleLogger();

  public child(): Logger {
    return ConsoleLogger.global;
  }

  /* tslint:disable:no-console */
  public debug(...params: Array<unknown>) {
    console.debug(params);
  }

  public info(...params: Array<unknown>) {
    console.info(params);
  }

  public warn(...params: Array<unknown>) {
    console.warn(params);
  }

  public error(...params: Array<unknown>) {
    console.error(params);
  }
  /* tslint:enable:no-console */
}
