// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

export interface ChapterSegment {
  title?: string;
  content: string;
}

/**
 * Parse a PDF file into chapter segments.
 *
 * Extracts raw text from PDF, then runs the same chapter-detection
 * logic as parseTxtToChapters (supports Chương / Chapter markers).
 */
export async function parsePdfToChapters(buffer: Buffer): Promise<ChapterSegment[]> {
  try {
    const data = await pdfParse(buffer);
    return parseTxtToChapters(data.text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse PDF: ${message}`);
  }
}

/**
 * Parse a Markdown file into chapter segments.
 *
 * Rules:
 * - H1 (#), H2 (##), H3 (###) headings become chapter boundaries.
 * - The heading text becomes the chapter title.
 * - Content between headings becomes the chapter body.
 * - Leading/trailing blank lines in each body are trimmed.
 * - Segments with empty content after trim are skipped.
 */
export function parseMarkdownToChapters(text: string): ChapterSegment[] {
  const lines = text.split(/\r?\n/);
  const segments: ChapterSegment[] = [];
  let currentTitle: string | undefined;
  let currentLines: string[] = [];

  const flush = () => {
    const content = currentLines.join('\n').trim();
    if (content) segments.push({ title: currentTitle, content });
    currentLines = [];
    currentTitle = undefined;
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flush();
      currentTitle = headingMatch[2].trim();
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return segments;
}

/**
 * Parse a plain-text file into chapter segments.
 *
 * Detects chapter markers like:
 *   "Chapter 1", "Chương 1", "CHAPTER I", "Chương I: Tựa đề"
 *
 * Falls back to treating the whole file as a single chapter if no
 * markers are found.
 */
export function parseTxtToChapters(text: string): ChapterSegment[] {
  // Matches: Chapter/Chương/Chuong + number (Arabic or Roman) + optional subtitle
  const CHAPTER_PATTERN =
    /^(chapter|ch[uư][oơ]ng|chuong|ch\.?)\s*[\dIVXivx]+[:\-.]?\s*(.*)?$/i;

  const lines = text.split(/\r?\n/);
  const segments: ChapterSegment[] = [];
  let currentTitle: string | undefined;
  let currentLines: string[] = [];
  let foundMarker = false;

  const flush = () => {
    const content = currentLines.join('\n').trim();
    if (content) segments.push({ title: currentTitle, content });
    currentLines = [];
    currentTitle = undefined;
  };

  for (const line of lines) {
    const match = line.trim().match(CHAPTER_PATTERN);
    if (match) {
      foundMarker = true;
      flush();
      currentTitle = line.trim();
    } else {
      currentLines.push(line);
    }
  }
  flush();

  // No markers found → treat entire file as one chapter
  if (!foundMarker) {
    const content = text.trim();
    return content ? [{ title: undefined, content }] : [];
  }

  return segments;
}
