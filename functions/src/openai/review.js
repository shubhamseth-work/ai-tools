import dotenv from 'dotenv';
dotenv.config();
import { OpenAI } from "openai";
async function reviewCode() {
     const client = new OpenAI({
    baseURL: "https://models.github.ai/inference",
    apiKey: process.env.GITHUB_PAT
  });

  const response = await client.chat.completions.create({
    messages: [
      { role:"system", content: "Your task is to analyze the provided javascript code for bugs and comments and best practice" },
      { role:"user", content: `function sum(a,b) {
        return a + b;
        }
        console.log(sum(5, 10));`}
    ],
    model: "openai/gpt-4o",
        temperature: 1,
        max_tokens: 2024,
        top_p: 1
    });

  console.log(response.choices[0].message.content);
  return response.choices[0].message.content;
}


export {reviewCode};