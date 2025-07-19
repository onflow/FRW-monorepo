/**
 * Get the error message from an error object
 * @param error - The unknown error object
 * @returns The error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return String(error);
}

/**
 * Check if an object is an error
 * @param error - The object to check
 * @returns True if the object is an error, false otherwise
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Ensure an object is an error
 * @param error - The object to check
 * @returns The error object
 */
export function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}
