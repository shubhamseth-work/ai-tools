// openRouterService.js
import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import {formatLLMResponse } from '../util/formatter.js';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
console.log('OpenRouter API Key:', OPENROUTER_API_KEY ? 'Loaded' : 'Not Loaded');


const chat = new ChatOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  temperature: 0.7,
  modelName6: 'openai/gpt-3.5-turbo', // ✅ Pick any supported model
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1', // ✅ OpenRouter endpoint
    defaultHeaders: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`, // ✅ Your OpenRouter API key
      'HTTP-Referer': 'http://localhost', // optional, helps OpenRouter track usage
    },
  },
});

// Prompt: system + user
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant.'],
  ['human', '{input}'],
]);

const grammarPrompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a grammar and spelling corrector. Fix the input without changing its meaning.'],
  ['human', '{input}'],
]);


const grammarChain = RunnableSequence.from([grammarPrompt, chat]);

async function correctGrammar(inputText) {
  const result = await grammarChain.invoke({ input: inputText });
  return result.content.trim();
}

const mainChain = RunnableSequence.from([prompt, chat]);


// Exported function
async function sendOpenAiPrompt(userInput) {
  try {
    console.log('userInput Prompt:', userInput);
    const correctedPrompt = await correctGrammar(userInput);
    console.log('Corrected Prompt:', correctedPrompt);
    const response = await mainChain.invoke({ input: correctedPrompt });
    const formatted = formatLLMResponse(response.content);
    console.log('OpenRouter response', formatted);
    return formatted;
  } catch (err) {
    console.error('OpenRouter error:', err.response?.data || err.message || err);
    throw new Error('OpenRouter request failed.');
  }
}

export { sendOpenAiPrompt };
