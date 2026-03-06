const { GoogleGenAI } = require("@google/genai");
const fs = require("fs-extra");
const Store = require("electron-store");
const store = new Store();

class GeminiService {
  constructor() {
    this.modelName = "gemini-3-flash-preview"; // Updated to a more standard stable version if needed, or keep your preference
    this.ai = null;
  }

  getAI() {
    // Try to get key from store first (saved by user), then fallback to env
    const config = store.get("config", {});
    const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;

    console.log({ apiKey });
    if (!apiKey) {
      throw new Error(
        "Gemini API Key is not set. Please go to Settings to enter your key.",
      );
    }

    // Always re-initialize to ensure we use the latest key if it changed
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        fetch: require("node-fetch"),
      },
    });
  }

  async generateCaption(content, imagePath = null) {
    try {
      let prompt = `You are a professional TikTok content creator. Generate an engaging, trendy TikTok caption for the following content:\n\nContent: ${content}\n\nRequirements:\n- Must be engaging and viral-worthy\n- Include relevant hashtags\n- Keep it concise (under 150 characters)\n- Use trendy language suitable for TikTok\n- Add appropriate emojis\n\nGenerate only the caption, nothing else.`;

      const response = await this.getAI().models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      console.log({ prompt, response: response.text.trim() });
      return response.text.trim();
    } catch (error) {
      console.error("Error generating caption:", error);
      throw error;
    }
  }

  async generateVideoPrompt(content, imagePath = null) {
    try {
      let prompt = `You are a creative video director. Create a short Sora video generation prompt for a trendy social media product video based on this product:

Content: ${content}

Requirements:
- MUST be exactly 1 short sentence.
- MUST be a single continuous line (NO line breaks).
- Focus only on visual description: camera movement, lighting, environment, and product action.
- A generic person may appear and speak Vietnamese to introduce the product.

SORA SAFETY RULES (VERY IMPORTANT):
- ONLY describe generic people (e.g. "a young woman", "a presenter", "a person").
- NEVER mention creators, influencers, TikTokers, streamers, idols, celebrities, or real people.
- NEVER mention brands like Apple, iPhone, Samsung, etc.
- NEVER describe someone that looks like a specific person.
- NEVER use the words: creator, influencer, tiktoker, streamer, idol, celebrity.
- Refer to devices only as "a smartphone".

Style:
- energetic social media commercial
- cinematic lighting
- dynamic camera movement

Keep under 100 words.
Do not include hashtags or on-screen text.`;

      console.log({ "22222222222222222222222": prompt });
      const response = await this.getAI().models.generateContent({
        model: this.modelName,
        contents: prompt,
      });
      return response.text.replace(/[\r\n]+/g, " ").trim();
    } catch (error) {
      console.error("Error generating video prompt:", error);
      throw error;
    }
  }

  async generateSoraPrompt(content) {
    try {
      return await this.generateVideoPrompt(content);
    } catch (error) {
      console.error("Error generating Sora prompt:", error);
      throw error;
    }
  }
}

module.exports = new GeminiService();
