# 📂 Complete File Structure & Reference

## Project Files Overview

```
tiktok_gen_video_sell/
│
├── 📄 Configuration & Setup Files
│   ├── package.json              # NPM dependencies and scripts
│   ├── .env                      # Your API keys (keep secret!)
│   ├── .env.example              # Template for .env
│   ├── .gitignore                # Git ignore rules
│   └── .vscode/settings.json     # VS Code configuration
│
├── 📚 Documentation (Read These!)
│   ├── README.md                 # Complete project documentation ⭐
│   ├── GETTING_STARTED.md        # Start here! ⭐⭐⭐
│   ├── QUICKSTART.md             # 5-minute quick guide ⭐⭐
│   ├── INSTALLATION.md           # Detailed installation guide
│   ├── DEVELOPMENT.md            # Developer guide
│   ├── TROUBLESHOOTING.md        # Common issues & solutions
│   ├── PROJECT_SUMMARY.md        # Feature summary
│   └── CHECKLIST.js              # Setup checklist
│
├── 🚀 Application Entry Points
│   ├── main.js                   # Electron main process
│   ├── preload.js                # Security bridge (Electron)
│   └── package.json              # Start scripts here
│
├── ⚙️ Setup Scripts
│   ├── setup.sh                  # macOS/Linux setup
│   └── setup.bat                 # Windows setup
│
├── 📁 src/ (Application Source)
│   ├── index.js                  # React entry point
│   ├── index.css                 # Global styles
│   │
│   ├── components/               # React UI Components
│   │   ├── App.js                # Root component
│   │   ├── App.css               # App styles
│   │   ├── Dashboard.js          # Main layout & state
│   │   ├── TikTokForm.js         # URL input form
│   │   ├── CaptionGenerator.js   # Caption generation UI
│   │   ├── SoraVideoGenerator.js # Video generation UI
│   │   └── ProgressTracker.js    # Progress display
│   │
│   ├── styles/                   # Component CSS
│   │   ├── Dashboard.css
│   │   ├── TikTokForm.css
│   │   ├── CaptionGenerator.css
│   │   ├── SoraVideoGenerator.css
│   │   └── ProgressTracker.css
│   │
│   └── services/                 # Backend Business Logic
│       ├── tiktokExtractor.js    # TikTok URL parsing & data extraction
│       ├── geminiService.js      # Google Gemini AI integration
│       └── soraAutomation.js     # Sora browser automation
│
├── 📁 public/                    # Static Files
│   └── index.html                # HTML template
│
├── 📁 node_modules/ (Created by npm install)
│   └── [all npm packages]
│
└── 📁 build/ (Created after npm run react-build)
    └── [compiled React app]
```

---

## 📄 File Descriptions

### Root Level Files

#### `package.json`
- **Purpose**: Lists all dependencies and scripts
- **Edit**: Add new npm scripts here
- **Don't Edit**: Package versions (use npm install)

#### `main.js`
- **Purpose**: Electron main process (backend)
- **Contains**: IPC handlers, window creation, API calls
- **Edit**: Add new IPC handlers here
- **Don't Edit**: Electron boilerplate unless you know what you're doing

#### `preload.js`
- **Purpose**: Security bridge between React and Electron
- **Contains**: Exposed APIs (electronAPI)
- **Edit**: Add new exposed methods here
- **Don't Edit**: Context isolation code

#### `.env`
- **Purpose**: Store your API keys
- **Contains**: GEMINI_API_KEY, etc.
- **Edit**: Add your actual API key here
- **Don't Edit**: Variable names
- **Important**: Never commit to git!

#### `.env.example`
- **Purpose**: Template for .env
- **Contains**: Example API key placeholders
- **Edit**: Only if adding new API keys to template
- **Don't Edit**: Usually not needed

#### `.gitignore`
- **Purpose**: Tell git which files to ignore
- **Contains**: .env, node_modules, build/
- **Edit**: Add more ignored patterns if needed
- **Don't Edit**: Usually not needed

---

### Documentation Files

#### `README.md` ⭐
- **Purpose**: Complete project overview
- **Read**: When you want full understanding
- **Contains**: Features, setup, usage, architecture

#### `GETTING_STARTED.md` ⭐⭐⭐
- **Purpose**: Beginner's guide
- **Read**: First! Contains setup and first usage
- **Contains**: Step-by-step guide, FAQ, tips

#### `QUICKSTART.md` ⭐⭐
- **Purpose**: Quick reference
- **Read**: When you remember project setup
- **Contains**: Common scenarios, keyboard shortcuts

#### `INSTALLATION.md`
- **Purpose**: Detailed installation instructions
- **Read**: When setup doesn't work
- **Contains**: Step-by-step by OS, troubleshooting

#### `DEVELOPMENT.md`
- **Purpose**: Developer guide
- **Read**: When you want to modify code
- **Contains**: Architecture, how to add features

#### `TROUBLESHOOTING.md`
- **Purpose**: Problem solving guide
- **Read**: When something goes wrong
- **Contains**: Common issues and solutions

---

### Source Code Files

#### `src/index.js`
- **Purpose**: React application entry point
- **Contains**: React.createRoot, mount to DOM
- **Edit**: Usually not needed

#### `src/index.css`
- **Purpose**: Global CSS styles
- **Contains**: Body, general styles
- **Edit**: Add global styles here

#### `src/components/App.js`
- **Purpose**: Root React component
- **Contains**: App shell
- **Edit**: Usually not needed

#### `src/components/Dashboard.js`
- **Purpose**: Main layout and state management
- **Contains**: Step workflow, progress tracking
- **Edit**: Change workflow steps here

#### `src/components/TikTokForm.js`
- **Purpose**: URL input form
- **Contains**: Form for TikTok URL, validation
- **Edit**: Change form fields here

#### `src/components/CaptionGenerator.js`
- **Purpose**: Caption generation UI
- **Contains**: Generate, edit, confirm caption
- **Edit**: Modify caption flow here

#### `src/components/SoraVideoGenerator.js`
- **Purpose**: Video generation UI
- **Contains**: Character selection, prompt generation
- **Edit**: Add video generation options here

#### `src/components/ProgressTracker.js`
- **Purpose**: Show progress status
- **Contains**: Progress steps, log display
- **Edit**: Modify progress display here

#### `src/styles/*.css`
- **Purpose**: Component-specific styles
- **Edit**: Change colors, fonts, layout here

---

### Service Files (Backend Logic)

#### `src/services/tiktokExtractor.js`
- **Purpose**: TikTok content extraction
- **Contains**: URL validation, web scraping, image download
- **Methods**:
  - `extractTikTokData(url)` - Main extraction function
  - `isValidTikTokUrl(url)` - Validate URL format
  - `extractVideoId(url)` - Get video ID from URL
  - `downloadImage(url, videoId)` - Download thumbnail

#### `src/services/geminiService.js`
- **Purpose**: Google Gemini AI integration
- **Contains**: Caption and prompt generation
- **Methods**:
  - `generateCaption(content, imagePath)` - Create TikTok caption
  - `generateVideoPrompt(content, imagePath)` - Create Sora prompt
  - `generateSoraPrompt(content)` - Alias for generateVideoPrompt

#### `src/services/soraAutomation.js`
- **Purpose**: Sora video generation automation
- **Contains**: Browser automation with Puppeteer
- **Methods**:
  - `createVideoWithCharacter(imageData, prompt, characterId)` - Main function
  - `initBrowser()` - Start Puppeteer
  - `uploadImage(page, imagePath)` - Upload image to Sora
  - `enterPrompt(page, prompt)` - Enter text prompt
  - `selectCharacter(page, characterId)` - Choose character
  - `submitVideoGeneration(page)` - Submit for generation
  - `waitForVideoGeneration(page)` - Monitor completion
  - `closeBrowser()` - Cleanup

---

### Static Files

#### `public/index.html`
- **Purpose**: HTML template
- **Contains**: `<div id="root">` where React mounts
- **Edit**: Add meta tags, change title

---

## 📊 Quick File Reference

### Files You'll Edit Most
1. `src/components/` - UI changes
2. `src/styles/` - Design changes
3. `.env` - API keys
4. `main.js` - Backend logic changes

### Files You'll Read Most
1. `GETTING_STARTED.md` - Quick reference
2. `QUICKSTART.md` - Common tasks
3. `README.md` - Features and usage

### Files You Shouldn't Edit
1. `preload.js` - Security code
2. `package.json` - Unless adding packages
3. `.gitignore` - Usually fine as-is
4. `public/index.html` - Usually fine as-is

---

## 🔐 Security-Sensitive Files

### Keep Secret (Never Commit)
- ✗ `.env` (Contains API keys)

### Keep Safe (Don't Share)
- ✗ Any file with `GEMINI_API_KEY`
- ✗ Any file with credentials

### Safe to Share
- ✓ `.env.example` (Template only)
- ✓ All `.js` and `.css` files
- ✓ All documentation
- ✓ All configuration except actual `.env`

---

## 📈 File Size Reference

| File | Size | Notes |
|------|------|-------|
| `main.js` | ~2KB | Electron entry |
| `preload.js` | ~1KB | Security bridge |
| `src/components/*.js` | 3-4KB each | UI components |
| `src/services/*.js` | 4-6KB each | Business logic |
| `package.json` | ~2KB | Dependencies |
| `node_modules/` | ~800MB | Don't commit! |

---

## 🔄 File Dependencies

```
main.js
├── preload.js (imports)
├── src/services/tiktokExtractor.js (requires)
├── src/services/geminiService.js (requires)
└── src/services/soraAutomation.js (requires)

package.json
├── React
├── Electron
├── Puppeteer
├── Axios
├── Cheerio
└── Other dependencies

src/index.js
└── src/components/App.js
    └── src/components/Dashboard.js
        ├── src/components/TikTokForm.js
        ├── src/components/CaptionGenerator.js
        ├── src/components/SoraVideoGenerator.js
        └── src/components/ProgressTracker.js
```

---

## 🛠️ Working with Files

### Editing Files

**macOS/Linux:**
```bash
# Text editor
nano src/components/App.js

# Or use VS Code
code src/components/App.js
```

**Windows:**
```bash
# Notepad
notepad src/components/App.js

# Or use VS Code
code src/components/App.js
```

### Creating New Files

```bash
# Component
touch src/components/MyComponent.js

# Service
touch src/services/myService.js

# Style
touch src/styles/MyComponent.css
```

### Deleting Files

```bash
# macOS/Linux
rm src/components/OldComponent.js

# Windows
del src\components\OldComponent.js
```

---

## 📋 File Checklist

When setup is complete, verify these files exist:

- [ ] `package.json`
- [ ] `main.js`
- [ ] `preload.js`
- [ ] `.env` (with your API key)
- [ ] `src/index.js`
- [ ] `src/components/App.js`
- [ ] `src/components/Dashboard.js`
- [ ] `src/services/tiktokExtractor.js`
- [ ] `src/services/geminiService.js`
- [ ] `src/services/soraAutomation.js`
- [ ] All CSS files in `src/styles/`
- [ ] `public/index.html`
- [ ] `README.md`
- [ ] `GETTING_STARTED.md`

---

## 🔍 File Search Help

Find files by name:
```bash
# macOS/Linux
find . -name "*.js" -type f

# Windows (PowerShell)
Get-ChildItem -Path . -Filter *.js -Recurse
```

Search for text in files:
```bash
# macOS/Linux
grep -r "function_name" src/

# Windows (PowerShell)
Select-String -Path "src/*" -Pattern "function_name"
```

---

## 📚 How to Read the Codebase

### For Beginners
1. Start with `package.json` - see what's installed
2. Read `main.js` - see app structure
3. Browse `src/components/` - see UI
4. Look at `src/services/` - see logic

### For Developers
1. Check `package.json` - dependencies
2. Study `main.js` - IPC handlers
3. Read `src/services/` - business logic
4. Check `src/components/` - UI implementation

### For Troubleshooting
1. Check `.env` - API keys present?
2. Look at `main.js` - error handling?
3. Check `src/services/` - API calls working?
4. See `src/components/` - UI displaying?

---

## 💾 File Backup

Important files to backup:
- `.env` - Your API keys
- `src/` - Your code modifications
- Any custom files you create

Don't backup:
- `node_modules/` - Can be reinstalled
- `build/` - Can be rebuilt
- `dist/` - Can be rebuilt

---

## 🎯 Key Takeaways

1. **Read GETTING_STARTED.md first** ⭐
2. **Keep .env secret** 🔐
3. **Edit src/ for modifications** ✏️
4. **Don't edit preload.js** ⚠️
5. **All documentation files are helpful** 📚

---

Version: 1.0.0
Last Updated: February 2026

For more help, see [README.md](README.md) or [GETTING_STARTED.md](GETTING_STARTED.md)
