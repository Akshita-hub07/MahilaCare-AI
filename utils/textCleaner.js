/**
 * MahilaCare AI - Text Cleaner Utility
 * Completely strips markdown code blocks, JSON code fences (```json ... ```),
 * and raw JSON strings from user-visible AI responses.
 */

export function stripCodeAndJsonFences(input) {
  if (!input || typeof input !== 'string') return '';
  let text = input;

  // 1. Process Markdown code blocks ```json ... ``` or ``` ... ```
  text = text.replace(/```(?:json|javascript|js)?\s*([\s\S]*?)\s*```/gi, (match, p1) => {
    const trimmed = (p1 || '').trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed.summary === 'string') return parsed.summary;
      if (parsed && typeof parsed.text === 'string') return parsed.text;
      if (parsed && typeof parsed.response === 'string') return parsed.response;
      if (parsed && typeof parsed.explanation === 'string') return parsed.explanation;
      if (parsed && typeof parsed.plainExplanation === 'string') return parsed.plainExplanation;
      return '';
    } catch (e) {
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) return '';
      return trimmed;
    }
  });

  // 2. Remove isolated ``` fences
  text = text.replace(/```(?:json|javascript|js)?/gi, '').replace(/```/g, '');

  // 3. Remove raw embedded JSON objects { "intent": ... } or { "summary": ... }
  text = text.replace(/\{\s*"[a-zA-Z0-9_]+\s*":[\s\S]*?\}/g, (match) => {
    try {
      const parsed = JSON.parse(match.trim());
      if (parsed && typeof parsed.summary === 'string') return parsed.summary;
      if (parsed && typeof parsed.text === 'string') return parsed.text;
      if (parsed && typeof parsed.explanation === 'string') return parsed.explanation;
      if (parsed && typeof parsed.plainExplanation === 'string') return parsed.plainExplanation;
      return '';
    } catch (e) {
      return '';
    }
  });

  // 4. Remove JSON key-value residue if any left over
  text = text.replace(/"[a-zA-Z0-9_]+"\s*:\s*("(?:[^"\\]|\\.)*"|\[[\s\S]*?\]|\{[\s\S]*?\}|true|false|null|\d+),?/g, '');

  // 5. Trim leftover bracket noise
  text = text.replace(/^\s*[\{\}\[\]"']+/g, '').replace(/[\{\}\[\]"']+\s*$/g, '').trim();

  return text;
}
