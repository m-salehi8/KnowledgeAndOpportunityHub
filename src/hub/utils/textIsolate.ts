// @ts-nocheck
/**
 * Strictly prevents bidirectional text scrambling in Persian (RTL) contexts
 * by wrapping English acronyms, technical terms, and phrases in <bdi dir="ltr">
 * unless they are already wrapped in HTML tags.
 */
export function isolateEnglishTerms(text: string): string {
  if (!text) return '';

  // If text already has HTML tags, we should only isolate English words outside of tags and attributes
  // A safe approach: split by existing tags and only apply to text segments
  const tagRegex = /(<[^>]+>)/g;
  const parts = text.split(tagRegex);

  return parts
    .map((part) => {
      // If it's an HTML tag, leave it intact
      if (part.startsWith('<') && part.endsWith('>')) {
        return part;
      }

      // In plain text segment, find English words/terms/phrases
      // e.g. "FastAPI", "Micro-SaaS", "API", "MCP", "Next.js", "v2.0"
      return part.replace(
        /\b([A-Za-z0-9][A-Za-z0-9\-_./]*(?:\s+[A-Za-z0-9\-_./]+)*)\b/g,
        (match) => {
          // If purely digits, leave alone
          if (/^\d+$/.test(match)) return match;
          return `<bdi dir="ltr">${match}</bdi>`;
        }
      );
    })
    .join('');
}
