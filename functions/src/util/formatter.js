// formatter.js
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import hljs from 'highlight.js';

// Optional: enable syntax highlighting for code blocks
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    } else {
      return hljs.highlightAuto(code).value;
    }
  },
});

/**
 * Convert markdown to safe, formatted HTML
 * @param {string} text - raw LLM output
 * @returns {string} - HTML
 */
export function formatLLMResponse(markdownText) {
  const rawHtml = marked(markdownText);
  const cleanHtml = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      code: ['class'],
      img: ['src', 'alt'],
    },
  });
  return cleanHtml;
}
