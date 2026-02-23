# Quick Start Guide

## 🚀 5-Minute Setup

### Windows Users
1. Double-click `setup.bat`
2. Follow the on-screen prompts
3. Edit `.env` with your API keys

### macOS / Linux Users
```bash
chmod +x setup.sh
./setup.sh
```

---

## 🔑 Getting API Keys

### Google Gemini API (Required)

1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your key
4. Paste into `.env` file:
   ```
   GEMINI_API_KEY=your_key_here
   ```

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day

---

## 📱 TikTok URL Format

Your TikTok URLs must be in this format:
```
https://www.tiktok.com/@username/video/123456789
```

**Valid Examples:**
- https://www.tiktok.com/@tiktok/video/7123456789012345678
- https://www.tiktok.com/@creator_name/video/7098765432109876543

**Invalid Examples:**
- https://vm.tiktok.com/... (short links won't work)
- https://www.tiktok.com/explore (non-video URLs)
- tiktok.com/@user/video/123 (missing https://)

---

## 🎬 Workflow

### Step 1: Extract TikTok Content
- Paste the full TikTok URL
- Wait for content extraction
- System downloads title, description, and image

### Step 2: Generate Caption
- Review extracted content
- Click "Generate Caption" or "Generate Smart Prompt"
- Edit if needed
- Click "Use This Caption & Continue"

### Step 3: Create Sora Video
- Configure character selection
- Generate video prompt (AI creates detailed scene description)
- Click "Create Video with Sora"
- **Browser will open** - you may need to:
  - Login to your ChatGPT account
  - Review video generation parameters
  - Confirm video creation

---

## ⌨️ Keyboard Shortcuts

- `Ctrl+C` or `Cmd+C`: Stop development server
- `F12`: Open developer tools (dev mode only)
- `Reload`: Refresh application

---

## 🐛 Common Issues & Solutions

### "Invalid TikTok URL"
- Use full URL format: `https://www.tiktok.com/@username/video/123...`
- Check URL contains `/video/` and video ID
- Don't use shortened URLs

### "GEMINI_API_KEY not found"
- Open `.env` file
- Add your API key: `GEMINI_API_KEY=your_key_here`
- Save and restart application
- Restart after every `.env` change

### "Browser won't open for Sora"
- Allow application to open browser
- Check firewall settings
- Ensure no popup blocker is active
- Try different browser

### Application won't start
- Run `npm install` again
- Delete `node_modules` folder
- Run `npm install` again
- Restart computer

### "No image found" error
- Some TikTok videos may have restricted image access
- Try different video
- Check internet connection

---

## 📊 What Each Component Does

| Component | Purpose |
|-----------|---------|
| **TikTok Extractor** | Parses URL, downloads content |
| **Gemini Service** | Generates captions and video prompts |
| **Sora Automation** | Opens browser, controls video generation |
| **Progress Tracker** | Shows what's happening |

---

## 📈 Tips for Best Results

1. **Choose Good Source Videos**
   - Clear, well-lit content works best
   - Good descriptions help AI understand context
   - Popular videos have better metadata

2. **Edit Generated Captions**
   - Add personal brand hashtags
   - Adjust tone for your audience
   - Include calls-to-action

3. **Sora Character Selection**
   - Default: `vuluu2k.thao`
   - Experiment with different characters
   - Some work better for certain content types

4. **Video Prompts**
   - Let AI generate first
   - Edit for specific effects/scenes
   - Be detailed about movements and emotions

---

## 🔒 Security

- **Never share API keys** via email or chat
- **Rotate keys regularly** if exposed
- **Use `.env` file** (never `.env.example`)
- `.env` is git-ignored automatically

---

## 💡 Pro Tips

- **Batch Processing**: Process multiple videos in sequence
- **Save Captions**: Copy good captions for future use
- **Template Prompts**: Use similar prompts for series
- **Character Consistency**: Use same character for brand consistency

---

## 🆘 Need Help?

### Check These First:
1. Verify API key is correct
2. Check internet connection
3. Restart the application
4. Look at console errors (F12 in dev mode)

### Error Messages:
- `Network error`: Check internet connection
- `Invalid API key`: Regenerate key or paste correctly
- `Timeout`: Sora server busy - try again later
- `Character not found`: Verify character ID is correct

---

## ⚙️ Advanced Configuration

### Custom Character
Edit in step 3, replace `vuluu2k.thao` with your character ID.

### API Rate Limiting
Free Gemini tier: 60 requests/minute
- Don't generate multiple captions in rapid succession
- Space out requests by 1 second

### Proxy Setup
If behind corporate firewall, configure in `package.json`:
```json
{
  "http-proxy-middleware": "^2.0.0"
}
```

---

## 📞 Contact & Support

Built with ❤️ for content creators

Version: 1.0.0
Last Updated: February 2026
