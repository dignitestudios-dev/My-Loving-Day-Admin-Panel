/**
 * Filters input to only allow safe characters (alphanumeric, spaces, basic punctuation: . - _ @).
 * Blocks SQL-like syntax and dangerous special characters (', ", ;, --, <, >, (, ), $, etc.).
 */
export function filterSafeSearchInput(input: string): string {
  if (!input) return "";
  return input.replace(/[^a-zA-Z0-9\s._@\-]/g, "");
}

/**
 * Checks if a string contains unsafe special characters (such as SQL injection patterns or symbols).
 */
export function hasUnsafeSearchCharacters(input: string): boolean {
  if (!input) return false;
  return /[^a-zA-Z0-9\s._@\-]/.test(input);
}
