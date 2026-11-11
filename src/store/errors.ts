/**
 * Custom error types for the data store layer.
 */

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StoreError';
  }
}

export class StoreUnavailable extends StoreError {
  public readonly reason: string;
  constructor(reason: string = 'Store unavailable') {
    super(`Store unavailable: ${reason}`);
    this.name = 'StoreUnavailable';
    this.reason = reason;
  }
}

export class RateLimited extends StoreError {
  public readonly retryAfterSeconds: number;
  constructor(retryAfterSeconds: number = 60) {
    super('Rate limit exceeded');
    this.name = 'RateLimited';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
