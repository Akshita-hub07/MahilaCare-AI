import React from 'react';

/**
 * Parses basic markdown (bold, italic, headers, bullet points, numbered lists, line breaks)
 * into clean React elements so AI text renders naturally without truncation or raw markdown syntax.
 */
export const FormattedText = ({ text = '', className = '' }) => {
  if (!text) return null;

  let rawStr = String(text);

  // If raw string contains a JSON block with "summary", extract summary property
  if (rawStr.includes('"summary"')) {
    const summaryMatch = rawStr.match(/"summary"\s*:\s*"([^"]+)"/i);
    if (summaryMatch && summaryMatch[1]) {
      rawStr = summaryMatch[1];
    }
  }

  // Strip code fences (e.g. ```json ... ``` or ```)
  let cleanText = rawStr
    .replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1')
    .replace(/```/g, '')
    .trim();

  // If text was a pure JSON object, try parsing to get human text
  if (cleanText.startsWith('{') && cleanText.endsWith('}')) {
    try {
      const obj = JSON.parse(cleanText);
      if (obj.summary) cleanText = obj.summary;
      else if (obj.plainExplanation) cleanText = obj.plainExplanation;
      else if (obj.text) cleanText = obj.text;
    } catch (e) {
      // ignore
    }
  }

  const lines = cleanText.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = (keyPrefix) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="list-disc list-inside space-y-1.5 my-2.5 text-slate-800">
          {currentList.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(idx);
      elements.push(<div key={`space-${idx}`} className="h-2" />);
      return;
    }

    // Bullet points (* or -)
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      currentList.push(trimmed.substring(2).trim());
      return;
    }

    // Numbered lists (e.g. 1. or 2.)
    if (/^\d+\.\s/.test(trimmed)) {
      flushList(idx);
      const content = trimmed.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={`num-${idx}`} className="flex items-start gap-2 my-1.5">
          <span className="font-bold text-purple-700 shrink-0">{trimmed.match(/^\d+\./)[0]}</span>
          <span className="leading-relaxed">{formatInlineText(content)}</span>
        </div>
      );
      return;
    }

    flushList(idx);

    // Headings (### or ## or #)
    if (trimmed.startsWith('#')) {
      const titleText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={`head-${idx}`} className="font-extrabold text-slate-900 text-sm sm:text-base mt-3 mb-1.5">
          {formatInlineText(titleText)}
        </h4>
      );
      return;
    }

    // Standard paragraph line
    elements.push(
      <p key={`p-${idx}`} className="leading-relaxed my-1">
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushList('final');

  return (
    <div className={`formatted-ai-text text-sm sm:text-base leading-relaxed break-words overflow-wrap-anywhere ${className}`}>
      {elements}
    </div>
  );
};

/**
 * Format inline text bold (**bold**), italic (*italic*), and inline code
 */
function formatInlineText(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-extrabold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**')) {
      return (
        <em key={index} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={index} className="bg-slate-100 text-purple-800 px-1.5 py-0.5 rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default FormattedText;
