/**
 * Log interface to fit console or bunyan.
 */
export interface Log {
  debug(msg: string, ...params: Array<any>): void;
  info(msg: string, ...params: Array<any>): void;
  warn(msg: string, ...params: Array<any>): void;
  error(msg: string, ...params: Array<any>): void;
}