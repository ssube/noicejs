import { Logger } from 'src/logger/Logger';

/**
 * Logger implementation using the console.
 */
export class ConsoleLogger implements Logger {
  public static readonly global = new ConsoleLogger();

  public child(): Logger {
    return ConsoleLogger.global;
  }

  public debug(...params: Array<any>) {
    console.debug(params);
  }

  public info(...params: Array<any>) {
    console.info(params);
  }

  public warn(...params: Array<any>) {
    console.warn(params);
  }

  public error(...params: Array<any>) {
    console.error(params);
  }
}
