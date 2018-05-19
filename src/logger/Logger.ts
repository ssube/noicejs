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
