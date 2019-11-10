/**
 * Base class for typed errors, adding nested errors (causes) to the stack.
 *
 * @public
 */
export class BaseError extends Error {
  public readonly message: string;
  public readonly stack?: string;

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

    // using `isNil` here will cause a circular dependency between errors/BaseError and utils/index
    this.stack = this.nested.reduce((cur, err, idx) => {
      const stack = err.stack !== undefined ? err.stack : '';
      const indented = stack.replace(/\n/g, '\n  ');
      return `${cur}
  caused by (${idx + 1}/${this.nested.length}):
    ${indented}`;
    }, this.stack);
  }

  /**
   * Get the cause of this error: the first nested error.
   *
   * @public
   */
  public cause(): Error | undefined {
    return this.nested[0];
  }

  /**
   * Get the number of nested errors.
   *
   * @public
   */
  public get length() {
    return this.nested.length;
  }
}
