# 🚀 Getting Started - Complete Guide

Welcome to the **TikTok Video Generator** desktop application!

This guide will walk you through everything from setup to your first video.

---

## 📍 Where to Start?

### First Time Setup (Choose Your Path)

**I just want to start ASAP:**
→ Go to [5-Minute Quick Start](#5-minute-quick-start)

**I want detailed instructions:**
→ Go to [Detailed Setup](#detailed-setup)

**I need troubleshooting help:**
→ Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

**I'm a developer:**
→ Read [DEVELOPMENT.md](DEVELOPMENT.md)

---

## 5-Minute Quick Start

### For macOS/Linux Users

```bash
# 1. Navigate to project
cd /Users/mac/Documents/my_job/tiktok_gen_video_sell

# 2. Run setup
chmod +x setup.sh
./setup.sh

# 3. Edit .env (add your API key)
# Open .env file, add: GEMINI_API_KEY=your_key_here

# 4. Start!
npm run dev
```

### For Windows Users

```bash
# 1. Double-click setup.bat in the project folder

# 2. Edit .env (add your API key)
# Right-click .env → Open with Notepad
# Add: GEMINI_API_KEY=your_key_here
# Save (Ctrl+S)

# 3. Start!
# In command prompt, run:
npm run dev
```

### Get Your API Key (1 minute)

1. Visit: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key
4. Paste into `.env` file

**Done!** Application should open automatically.

---

## Detailed Setup

### Step 1: Verify Prerequisites

Check you have Node.js installed:
```bash
node -v
npm -v
```

Should show versions (e.g., v16.0.0, 8.0.0)

**If not installed:**
- Download: https://nodejs.org/ (LTS version)
- Install and restart terminal
- Re-run the version check

### Step 2: Navigate to Project

**macOS/Linux:**
```bash
cd /Users/mac/Documents/my_job/tiktok_gen_video_sell
pwd  # Verify correct location
```

**Windows:**
```bash
cd C:\Users\YourUsername\Documents\my_job\tiktok_gen_video_sell
cd   # Verify correct location
```

### Step 3: Install Dependencies

```bash
npm install
```

This downloads and installs all required packages (~500MB).
Wait for it to complete (may take 2-3 minutes).

### Step 4: Get Your Gemini API Key

1. Open: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"** button
3. Copy the key (it looks like: `sk_test_123abc...`)

### Step 5: Configure .env File

**macOS/Linux:**
```bash
nano .env
# Find the line: GEMINI_API_KEY=
# Replace with: GEMINI_API_KEY=sk_test_123abc...
# Save: Ctrl+X, then Y, then Enter
```

**Windows:**
1. Find `.env` file in project folder
2. Right-click → Open with → Notepad
3. Find line: `GEMINI_API_KEY=`
4. Replace with: `GEMINI_API_KEY=sk_test_123abc...`
5. Save: Ctrl+S

### Step 6: Start Application

```bash
npm run dev
```

You should see:
- "webpack compiled successfully" in terminal
- Electron app window opens
- Beautiful gradient UI appears

**Success!** ✅

---

## Using the Application

### The 3-Step Workflow

#### Step 1: Extract TikTok Content

1. Open a TikTok video on your phone/browser
2. Copy the full URL (looks like: `https://www.tiktok.com/@username/video/123456...`)
3. Paste into "Enter TikTok URL" field
4. Click **"Extract Data"**

Watch as the app:
- Fetches video metadata
- Downloads the thumbnail
- Shows success message

#### Step 2: Generate Caption

1. Review the extracted content
2. Click **"✨ Generate Caption"**
3. Wait 3-8 seconds for Gemini AI to create caption
4. Review the generated caption
5. Edit if you want (click ✏️ Edit)
6. Click **"✓ Use This Caption & Continue"**

Tips:
- You can regenerate if you don't like it
- Edit to add your own hashtags
- Regenerate as many times as you want

#### Step 3: Create Video

1. Review your caption
2. Select character (default: `vuluu2k.thao`)
3. Click **"✨ Generate Smart Prompt"**
4. AI creates detailed video prompt
5. Edit if needed
6. Click **"🎬 Create Video with Sora"**

Browser opens to Sora:
- You may need to login
- Follow Sora's interface
- Confirm video generation
- Wait for video to be created

---

## Understanding the Interface

### Main Layout

```
┌─────────────────────────────────────┬──────────────┐
│                                     │              │
│    🎵 TikTok Video Generator       │   Progress   │
│    (Main Content Area)              │   Tracker    │
│                                     │              │
│  - Form inputs                      │  • Extract   │
│  - Status messages                  │  • Caption   │
│  - Generated content                │  • Video     │
│                                     │              │
└─────────────────────────────────────┴──────────────┘
```

### Color Meanings

- 🟣 **Purple**: Main action buttons (Extract, Generate)
- 🟢 **Green**: Confirm/Continue buttons
- 🔴 **Red/Orange**: Error messages
- ⚪ **Gray**: Completed steps

---

## Valid TikTok URLs

### ✅ These Work:
```
https://www.tiktok.com/@username/video/7123456789012345678
https://www.tiktok.com/@cristiano/video/7098765432109876543
https://www.tiktok.com/@anyuser/video/1234567890
```

### ❌ These Don't Work:
```
https://vm.tiktok.com/...          (Short links)
https://www.tiktok.com/explore     (Non-video pages)
tiktok.com/@user/video/123         (Missing https://)
https://www.tiktok.com/@user       (No /video/)
```

### How to Get Valid URL:

1. Open TikTok in browser or app
2. Click Share button
3. Copy "Copy Link"
4. Use the full URL you copied

---

## Common First-Time Questions

### Q: Why does the browser open?
**A:** Sora video generation requires browser interaction. The app automates the process but you may need to confirm generation.

### Q: Can I use short TikTok links?
**A:** No, only full URLs work. Use the "Copy Link" button on TikTok.

### Q: How long does video generation take?
**A:** 5-30+ minutes depending on Sora servers. Just wait, don't close the browser.

### Q: What if the caption is bad?
**A:** Click "🔄 Generate New" to try again. Each generation is different.

### Q: Can I edit the caption?
**A:** Yes! Click ✏️ Edit to modify it. Your changes are saved.

### Q: What if extraction fails?
**A:** Try a different TikTok video. Some videos may have restricted access.

### Q: How many videos can I make?
**A:** Free Gemini tier: ~30 videos per day (1,500 requests). No Sora limit from app side.

---

## Tips for Best Results

### Choose Good Source Videos
- ✓ Clear, well-lit content
- ✓ Good description text
- ✓ Public videos only
- ✓ Not live videos

### Generate Captions
- Let AI create first version
- Edit to match your brand
- Add your hashtags
- Include call-to-action

### Create Videos
- Use generated prompt (it's detailed)
- Edit if you want specific effects
- Let Sora take time to generate
- Character consistency for series

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` / `Cmd+C` | Stop dev server (in terminal) |
| `F12` | Open developer tools |
| `Cmd+Shift+R` / `Ctrl+Shift+R` | Hard refresh browser |
| `Ctrl+W` | Close window |

---

## Troubleshooting Quick Fixes

### Application won't start
```bash
npm install
npm run dev
```

### API key error
1. Open `.env` file
2. Check: `GEMINI_API_KEY=sk_...`
3. No spaces around `=`
4. Restart application

### Port 3000 in use
```bash
PORT=3001 npm run dev
```

### Still stuck?
→ Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Next Steps

### After First Success:

1. **Try more videos**
   - Practice with different TikToks
   - See how captions vary
   - Experiment with Sora

2. **Customize the app**
   - Read [DEVELOPMENT.md](DEVELOPMENT.md)
   - Modify colors in CSS
   - Add new features

3. **Build for distribution**
   ```bash
   npm run build-mac   # For macOS
   npm run build-win   # For Windows
   ```

---

## File Reference

### Key Files to Know

| File | Purpose |
|------|---------|
| `.env` | Your API keys (keep secret!) |
| `main.js` | Electron app entry point |
| `package.json` | Dependencies list |
| `README.md` | Full documentation |
| `QUICKSTART.md` | Quick reference |
| `DEVELOPMENT.md` | If you want to code |

### Important Folders

| Folder | Contains |
|--------|----------|
| `src/components/` | React UI pages |
| `src/services/` | Backend logic |
| `src/styles/` | CSS styling |
| `public/` | Static files |

---

## Support Resources

### Need Help?

1. **Quick Questions**: Check [QUICKSTART.md](QUICKSTART.md)
2. **Setup Issues**: Check [INSTALLATION.md](INSTALLATION.md)
3. **Errors**: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. **Development**: Check [DEVELOPMENT.md](DEVELOPMENT.md)
5. **Everything**: Check [README.md](README.md)

---

## Success Checklist

- [ ] Node.js 14+ installed
- [ ] npm installed
- [ ] `npm install` completed
- [ ] `.env` file has API key
- [ ] `npm run dev` starts app
- [ ] Can enter TikTok URL
- [ ] Can extract content
- [ ] Can generate caption
- [ ] Can create video

---

## You're Ready!

You have everything you need. The app is:
- ✓ Fully configured
- ✓ Ready to use
- ✓ Well documented
- ✓ Easy to customize

**Start using it now:**
```bash
npm run dev
```

**Happy creating!** 🎬✨

---

## Quick Reference

```bash
# Install
npm install

# Start development
npm run dev

# Edit configuration
nano .env          # macOS/Linux
notepad .env       # Windows

# Get API key
# Visit: https://makersuite.google.com/app/apikey

# Build for Mac
npm run build-mac

# Build for Windows
npm run build-win
```

---

Version: 1.0.0  
Last Updated: February 2026

For more information, see [README.md](README.md)
