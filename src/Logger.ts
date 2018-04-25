/**
 * Log interface to fit console or bunyan.
 */
export interface Logger {
  debug(msg: string, ...params: Array<any>): void;
  debug(val: any, msg: string, ...params: Array<any>): void;
  info(msg: string, ...params: Array<any>): void;
  info(val: any, msg: string, ...params: Array<any>): void;
  warn(msg: string, ...params: Array<any>): void;
  warn(val: any, msg: string, ...params: Array<any>): void;
  error(msg: string, ...params: Array<any>): void;
  error(err: Error, msg: string, ...params: Array<any>): void;
  error(val: any, msg: string, ...params: Array<any>): void;
}