import { GoogleGenerativeAI  } from "@google/generative-ai";
import { API_KEY } from '../../util/constant.js'

const genAiClient = new GoogleGenerativeAI(API_KEY)
const model = genAiClient.getGenerativeModel({ model: "gemini-1.5-flash" })

async function sendPromtOutput(prompt) {
    console.log('📝 Sending prompt to Generative AI:', prompt);
    return new Promise(async (resolve, reject) => {
        try {
            const result = await model.generateContent({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            });

        const response = await result.response;
        resolve(response.text());
        } catch (error) {
            console.error('Error in sendPromtOutput:', error);
            reject(error);
        }
    })
}

export { sendPromtOutput };