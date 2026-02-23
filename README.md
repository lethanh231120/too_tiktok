# TikTok Video Generator - Desktop Application

Automated tool to extract TikTok content, generate captions using Gemini API, and create videos with Sora.

## Features

✨ **Key Features**:
- 🎵 Automatic TikTok URL content extraction
- 📸 Image/thumbnail download
- 🤖 AI-powered caption generation with Gemini API
- 🎬 Sora 2 video generation with browser automation
- 👤 Custom character selection (e.g., vuluu2k.thao)
- 💻 Cross-platform support (Windows & macOS)
- 🎨 Beautiful, intuitive UI
- 📋 Progress tracking

## Tech Stack

- **Frontend**: React 18 + CSS3
- **Desktop Framework**: Electron
- **Backend**: Node.js + Express
- **APIs**: 
  - Google Generative AI (Gemini)
  - Sora (via browser automation)
- **Automation**: Puppeteer
- **Data Parsing**: Cheerio

## Installation

### Prerequisites

- Node.js 14+ and npm
- Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Basic TikTok URL format knowledge

### Setup Steps

1. **Clone/Extract the project**
   ```bash
   cd /Users/mac/Documents/my_job/tiktok_gen_video_sell
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Keys**
   ```bash
   # Copy and edit .env file
   cp .env.example .env
   ```
   Then edit `.env` and add:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   SORA_API_KEY=your_sora_api_key_here
   ```

4. **Run the application**

   **Development mode** (with hot reload):
   ```bash
   npm run dev
   ```

   **Production mode**:
   ```bash
   npm start
   ```

5. **Build for distribution**

   **macOS**:
   ```bash
   npm run build-mac
   ```

   **Windows**:
   ```bash
   npm run build-win
   ```

## Usage

1. **Paste TikTok URL**: Enter a valid TikTok video URL
   - Format: `https://www.tiktok.com/@username/video/123456789`

2. **Extract Content**: The app will fetch:
   - Video title and description
   - Thumbnail image
   - Video metadata

3. **Generate Caption**: 
   - Uses Gemini AI to create a viral TikTok caption
   - Includes relevant hashtags and emojis
   - Editable before proceeding

4. **Create Video**:
   - Generate detailed prompt for Sora
   - Select character (default: vuluu2k.thao)
   - Browser opens to Sora (login if needed)
   - Review and confirm video generation

## Project Structure

```
tiktok_gen_video_sell/
├── main.js                      # Electron main process
├── preload.js                   # Electron context bridge
├── package.json                 # Dependencies & scripts
├── .env                         # API keys (git ignored)
├── src/
│   ├── services/
│   │   ├── tiktokExtractor.js  # TikTok URL parsing & image download
│   │   ├── geminiService.js    # Gemini AI caption generation
│   │   └── soraAutomation.js   # Sora browser automation
│   └── components/
│       ├── App.js               # Main React component
│       ├── Dashboard.js         # Layout & state management
│       ├── TikTokForm.js        # URL input form
│       ├── CaptionGenerator.js  # Caption generation UI
│       ├── SoraVideoGenerator.js # Video generation UI
│       ├── ProgressTracker.js   # Progress display
│       └── App.css
├── src/styles/                  # Component CSS files
├── build/                       # React build output
└── dist/                        # Electron build output
```

## API Configuration

### Google Gemini API
- Get free API key: https://makersuite.google.com/app/apikey
- Models used:
  - `gemini-pro`: Text-based caption generation
  - `gemini-pro-vision`: Image-aware caption generation

### Sora Integration
- Automated browser navigation to sora.chatgpt.com
- Handles image upload, prompt entry, and character selection
- Monitors video generation completion

## Environment Variables

```env
# Google Generative AI
GEMINI_API_KEY=sk_...

# Sora (if direct API available in future)
SORA_API_KEY=sk_...
```

## Troubleshooting

### Issues with TikTok URL extraction
- Ensure URL format is correct: `https://www.tiktok.com/@username/video/id`
- Some videos may be region-restricted or private
- Check internet connection

### Gemini API errors
- Verify API key is correct in `.env`
- Check API quotas at Google AI Studio
- Ensure API is enabled for your project

### Sora browser automation issues
- Browser may require manual login
- Allow 30+ seconds for authentication
- Ensure Chromium/Chrome is installed
- Check firewall settings

### Windows build issues
- Install Visual C++ redistributables
- Use Command Prompt (not PowerShell) for npm commands
- Check Windows Defender settings

## API Rate Limits

- **Gemini API**: Free tier has usage limits
- **Sora**: Limited availability, may require waitlist
- Implement rate limiting in production

## Security Notes

⚠️ **Important**:
- Never commit `.env` file to git
- Use environment variables for API keys
- Rotate API keys periodically
- Don't share credentials in URLs

## Development

### Running in Development Mode
```bash
npm run dev
```
This opens DevTools automatically.

### Building React Assets
```bash
npm run react-build
```

### Testing Components
Modify components in `src/components/` and changes will hot-reload.

## Known Limitations

- Sora video generation requires manual character selection in browser
- Browser must remain open during video generation
- Some TikTok videos may have restricted data access
- Rate limiting on Gemini API (free tier)

## Future Enhancements

- [ ] Direct Sora API integration (when available)
- [ ] Batch processing multiple TikTok URLs
- [ ] Video queue management
- [ ] Custom prompt templates
- [ ] TikTok account integration
- [ ] Automatic video upload
- [ ] Analytics dashboard
- [ ] Settings persistence

## Support & Issues

For issues or feature requests:
1. Check troubleshooting section
2. Review error logs in console
3. Ensure dependencies are updated: `npm install`

## License

MIT License - Feel free to modify and distribute

## Author Notes

Built with ❤️ for content creators who want to automate their TikTok workflow.

---

**Last Updated**: February 2026
