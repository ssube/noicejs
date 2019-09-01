import { Logger } from './Logger';

/**
 * Logger implementation that consumes input and produces no output.
 */
export class NullLogger implements Logger {
  public static readonly global = new NullLogger();

  public child() {
    return NullLogger.global;
  }

  public debug(...data: Array<unknown>) {
    /* noop */
  }

  public info(...data: Array<unknown>) {
    /* noop */
  }

  public warn(...data: Array<unknown>) {
    /* noop */
  }

  public error(...data: Array<unknown>) {
    /* noop */
  }
}
