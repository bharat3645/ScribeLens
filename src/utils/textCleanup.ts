/**
 * Cleans up raw Tesseract.js output: collapses whitespace runs, strips
 * stray isolated punctuation, and corrects a handful of very common
 * OCR character-confusion mistakes (e.g. a "1" recognized where an "l"
 * belongs in the middle of a word).
 *
 * This is a pure function (no DOM/canvas/worker dependencies) so it can
 * be unit-tested in isolation from the OCR pipeline itself.
 */
export function postProcessText(text: string): string {
  return text
    // Collapse runs of whitespace (including newlines) into a single space
    .replace(/\s+/g, ' ')
    // Remove isolated special characters surrounded by whitespace
    .replace(/(?<=\s)[^\w\s](?=\s)/g, '')
    // Fix common OCR mistakes
    .replace(/[|]|[1](?=[a-z])/g, 'l')
    .replace(/[0](?=[a-z])/g, 'o')
    .replace(/[5](?=[a-z])/g, 's')
    // Trim the result
    .trim();
}
