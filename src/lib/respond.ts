/**
 * Standard API response helper for Northside Discovery Centre.
 * Enforces uniform error and success JSON shapes.
 */

export interface ApiErrorPayload {
  code:
    | 'VALIDATION_ERROR'
    | 'NOT_FOUND'
    | 'RATE_LIMITED'
    | 'STORE_UNAVAILABLE'
    | 'UNAUTHORIZED'
    | 'INTERNAL';
  message: string;
  details?: Array<{ path: string; issue: string }>;
  fallback?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}

export function formatErrorResponse(
  code: ApiErrorPayload['code'],
  message: string,
  details?: Array<{ path: string; issue: string }>,
  fallback?: Record<string, unknown>
): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(fallback ? { fallback } : {}),
    },
  };
}
