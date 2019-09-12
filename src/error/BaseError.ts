/**
 * Base class for typed errors, adding nested errors (causes) to the stack.
 *
 * @public
 */
export class BaseError extends Error {
  public message: string;
  public stack?: string;
  protected nested: Array<Error>;

  /**
   * Create a new typed error.
   *
   * @param message - error message
   * @param nested - internal errors (causes)
   */
  constructor(message: string, ...nested: Array<Error>) {
    super(message);

    this.message = message;
    this.nested = nested;
    this.stack = nested.reduce((cur, err, idx) => {
      const stack = err.stack !== undefined ? err.stack : '';
      const indented = stack.replace('\n', '\n  ');
      return `${cur}\n  caused by (${idx + 1}/${nested.length}):\n    ${indented}`;
    }, this.stack);
  }

  /**
   * Get the cause of this error: the first nested error.
   */
  public cause(): Error | undefined {
    return this.nested[0];
  }

  /**
   * Get the number of nested errors.
   */
  get length() {
    return this.nested.length;
  }
}
