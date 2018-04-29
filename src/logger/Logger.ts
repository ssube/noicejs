/**
 * Log interface to fit console or bunyan.
 */
export interface Logger {
  child(options: any): Logger;

  debug(msg: string, ...params: Array<any>): void;
  debug(options: any, msg: string, ...params: Array<any>): void;

  error(msg: string, ...params: Array<any>): void;
  error(err: Error, msg: string, ...params: Array<any>): void;
  error(options: any, msg: string, ...params: Array<any>): void;

  info(msg: string, ...params: Array<any>): void;
  info(options: any, msg: string, ...params: Array<any>): void;

  warn(msg: string, ...params: Array<any>): void;
  warn(options: any, msg: string, ...params: Array<any>): void;
}