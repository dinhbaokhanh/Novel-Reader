/**
 * Counts words in a text string.
 * Handles both Vietnamese (space-separated syllables) and English.
 */
export function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
}
