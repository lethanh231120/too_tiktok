require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Hello, testing connection.',
    });
    console.log('SUCCESS:', response.text);
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.cause) console.error('CAUSE:', error.cause);
  }
}
test();
