/**
 * Helpers for the Prompt.tags column, stored as a JSON-encoded string[]
 * because SQLite has no native array type.
 */

export function stringifyTags(tags: string[]): string {
  return JSON.stringify(tags);
}

export function parseTags(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((t): t is string => typeof t === 'string');
    }
  } catch {
    // fall through
  }
  return [];
}
