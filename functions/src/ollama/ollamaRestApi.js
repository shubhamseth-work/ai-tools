import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_API_URL;
const MODEL = process.env.OLLAMA_TINYLLAMA_MODEL || process.env.OLLAMA_PHI_MODEL || "tinyllama";

function cleanLLMResponse(input, options = {}) {
  if (!input) return "";

  let text = String(input);

  // 1. Normalize escaped characters
  text = text
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");

  // 2. Remove unwanted quotes wrapping entire string
  text = text.replace(/^["']|["']$/g, "");

  // 3. Fix multiple concatenation artifacts (rare cases)
  text = text.replace(/"\s*\+\s*"/g, "");

  // 4. Normalize line endings
  text = text.replace(/\r\n/g, "\n");

  // 5. Remove excessive empty lines (max 2)
  text = text.replace(/\n{3,}/g, "\n\n");

  // 6. Trim spaces on each line
  text = text
    .split("\n")
    .map(line => line.trim())
    .join("\n");

  // 7. Fix bullet points (ensure spacing)
  text = text.replace(/(\d+\.)(\S)/g, "$1 $2"); // 1.Test → 1. Test
  text = text.replace(/[-*•](\S)/g, "- $1");    // -Test → - Test

  // 8. Remove trailing spaces
  text = text.replace(/[ \t]+$/gm, "");

  // 9. Optional: Remove markdown (if you want plain text)
  if (options.removeMarkdown) {
    text = text
      .replace(/```[\s\S]*?```/g, "")   // code blocks
      .replace(/`([^`]*)`/g, "$1")     // inline code
      .replace(/[*_~]/g, "");          // bold/italic
  }

  // 10. Optional: Convert to HTML-safe
  if (options.escapeHTML) {
    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // 11. Final trim
  return text.trim();
}

// Secure Chat API
const sendOllamaPrompt = async (message, options) => {
  try {
    const response = await axios.post(
      OLLAMA_URL,
      {
        model: options?.model || MODEL,
        prompt: message,
        stream: false
      },
      { timeout: 60000 }
    );
    const cleanedResponse = cleanLLMResponse(response.data.response);
    console.log('Ollama response:', cleanedResponse);
    return {
        success: true,
        response: cleanedResponse || response.data.response
    }

  } catch (err) {
    console.error(err.message);
    return {
      error: err.response?.data || err.message || "Ollama failed",
      code: err.response?.status || 500
    }
  }
};

export { sendOllamaPrompt };