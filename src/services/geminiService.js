const { GoogleGenAI } = require('@google/genai');
const fs = require('fs-extra');

class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    // The new SDK automatically picks up GEMINI_API_KEY from environment,
    // but we can pass it explicitly too just in case
    // In Electron, native fetch sometimes drops sockets. We override fetch or use httpOptions
    this.ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        // This helps prevent socket hang ups in Electron
        fetch: require('node-fetch')
      }
    });
    this.modelName = 'gemini-3-flash-preview';
  }

  async generateCaption(content, imagePath = null) {
    try {
      let prompt = `You are a professional TikTok content creator. Generate an engaging, trendy TikTok caption for the following content:\n\nContent: ${content}\n\nRequirements:\n- Must be engaging and viral-worthy\n- Include relevant hashtags\n- Keep it concise (under 150 characters)\n- Use trendy language suitable for TikTok\n- Add appropriate emojis\n\nGenerate only the caption, nothing else.`;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating caption:', error);
      throw error;
    }
  }

  async generateVideoPrompt(content, imagePath = null) {
    try {
      let prompt = `You are a creative video director. Create a detailed Sora AI video generation prompt based on this content:\n\nContent: ${content}\n\nGenerate a professional, detailed prompt for Sora that describes:\n- Scene composition\n- Camera movements\n- Characters and their actions\n- Lighting and mood\n- Visual style\n\nMake it vivid and detailed for AI video generation.`;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error generating video prompt:', error);
      throw error;
    }
  }

  async generateSoraPrompt(content) {
    try {
      return await this.generateVideoPrompt(content);
    } catch (error) {
      console.error('Error generating Sora prompt:', error);
      throw error;
    }
  }
}

module.exports = new GeminiService();
