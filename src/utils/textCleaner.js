/**
 * NariCare AI - Text Cleaner Utility
 * Completely strips markdown code blocks, JSON code fences (```json ... ```),
 * and raw JSON strings from user-visible AI responses.
 */

/**
 * Extracts a specific field value from an unparsed or malformed JSON string using regex.
 */
export function extractFieldFromUnparsedJson(jsonStr, fieldName) {
  if (!jsonStr || typeof jsonStr !== 'string') return null;

  // 1. Try matching "fieldName": "value"
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'i');
  const match = jsonStr.match(regex);
  if (match && match[1]) {
    return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\').trim();
  }

  // 2. Try matching "fieldName": ["item1", "item2"] array
  const arrayRegex = new RegExp(`"${fieldName}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'i');
  const arrayMatch = jsonStr.match(arrayRegex);
  if (arrayMatch && arrayMatch[1]) {
    const items = [];
    const itemRegex = /"(?:[^"\\]|\\.)*"/g;
    let m;
    while ((m = itemRegex.exec(arrayMatch[1])) !== null) {
      const val = m[0].slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"').trim();
      if (val) items.push(val);
    }
    if (items.length > 0) return items;
  }

  return null;
}

export function stripCodeAndJsonFences(input) {
  if (!input || typeof input !== 'string') return '';
  let text = input.trim();

  // 1. If text is wrapped in markdown code block, extract contents first
  const codeBlockMatch = text.match(/```(?:json|javascript|js)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim();
  }

  // 2. Try parsing JSON to extract summary or plain text field
  if (text.startsWith('{') || text.includes('"summary":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.summary === 'string' && parsed.summary.trim()) {
        return parsed.summary.trim();
      }
      if (parsed && typeof parsed.plainExplanation === 'string' && parsed.plainExplanation.trim()) {
        return parsed.plainExplanation.trim();
      }
      if (parsed && typeof parsed.text === 'string' && parsed.text.trim()) {
        return parsed.text.trim();
      }
    } catch (e) {
      // Regex extraction fallback if JSON.parse fails due to malformed quotes/newlines
      const extractedSummary = extractFieldFromUnparsedJson(text, 'summary') || extractFieldFromUnparsedJson(text, 'plainExplanation');
      if (typeof extractedSummary === 'string' && extractedSummary.trim()) {
        return extractedSummary.trim();
      }
    }
  }

  // 3. Strip any leftover isolated code fences
  text = text.replace(/```(?:json|javascript|js)?/gi, '').replace(/```/g, '');

  // 4. Strip JSON property keys if raw JSON string residue remains
  text = text.replace(/"(summary|plainExplanation|overallStatus|whenToSeekCare|disclaimer)"\s*:\s*/gi, '');
  text = text.replace(/"(keyFindings|extractedValues|recommendedProducts|generalPrecautions|nextSteps)"\s*:\s*\[[\s\S]*?\]/gi, '');
  text = text.replace(/"[a-zA-Z0-9_]+"\s*:\s*("(?:[^"\\]|\\.)*"|\[[\s\S]*?\]|\{[\s\S]*?\}|true|false|null|\d+),?/g, '');

  // 5. Clean structural JSON symbols and quotes
  text = text.replace(/[\{\}\[\]]/g, '');
  text = text.replace(/\\"/g, '"').replace(/^"+|"+$/g, '').trim();

  return text;
}

/**
 * Removes "Questions to ask your doctor", "Questions to consider", and any bulleted question lists
 * from AI-generated summaries on non-voice feature pages.
 */
export function stripQuestionsToAsk(input) {
  if (!input || typeof input !== 'string') return '';
  let text = input;

  // 1. Strip "Questions to ask..." headers and trailing question sections
  text = text.replace(/(?:###?\s*|\*\*|__)?(?:Questions\s+to\s+ask[\s\S]*|Questions\s+for\s+your\s+doctor[\s\S]*|Questions\s+to\s+discuss[\s\S]*|Suggested\s+questions[\s\S]*|Questions\s+to\s+consider[\s\S]*)(?:\*\*|__)?/gi, '');

  // 2. Filter out any lines or bullet points that end with a question mark (?)
  const lines = text.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (/(?:Questions\s+to\s+ask|Questions\s+for\s+your\s+doctor|Questions\s+to\s+discuss|Suggested\s+questions|Questions\s+to\s+consider)/i.test(trimmed)) return false;
    if (/^\s*[-*•\d\.]+\s+.*\?\s*$/i.test(trimmed)) return false;
    return true;
  });

  return filteredLines.join('\n').trim();
}
