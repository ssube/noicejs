import { Logger, LogLevel } from './Logger';

interface RealWinston {
  log(level: LogLevel, msg: string, ...data: Array<unknown>): void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export class WinstonLogger implements Logger {
  protected logger: RealWinston;

  constructor(logger: RealWinston) {
    this.logger = logger;
  }

  public child(options: any): WinstonLogger {
    return this;
  }

  public debug(options: any, msg?: any, ...params: Array<any>) {
    this.logger.log(LogLevel.Debug, msg, ...params, options);
  }

  public error(options: any, msg?: any, ...params: Array<any>) {
    this.logger.log(LogLevel.Error, msg, ...params, options);
  }

  public info(options: any, msg?: any, ...params: Array<any>) {
    this.logger.log(LogLevel.Info, msg, ...params, options);
  }

  public warn(options: any, msg?: any, ...params: Array<any>) {
    this.logger.log(LogLevel.Warn, msg, ...params, options);
  }
}
