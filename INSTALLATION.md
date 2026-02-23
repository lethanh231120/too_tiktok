# 📦 Complete Installation & Setup Guide

## Prerequisites

Before starting, ensure you have:

- **Node.js 14+**: Download from https://nodejs.org/
- **npm 6+**: Comes with Node.js
- **Internet connection**: For API calls
- **Administrator access**: For Windows installation

### Verify Prerequisites

Open terminal/command prompt and run:
```bash
node -v    # Should show v14.0.0 or higher
npm -v     # Should show 6.0.0 or higher
```

---

## Step-by-Step Installation

### macOS Installation

1. **Open Terminal** (Cmd + Space, type "Terminal")

2. **Navigate to project directory**
   ```bash
   cd /Users/mac/Documents/my_job/tiktok_gen_video_sell
   ```

3. **Run setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   This automatically:
   - Checks Node.js installation
   - Installs all dependencies
   - Creates `.env` file

4. **Configure API Keys**
   ```bash
   # Open .env file in your editor
   nano .env
   # Or use your favorite editor
   ```
   Add:
   ```
   GEMINI_API_KEY=your_actual_key_here
   SORA_API_KEY=your_sora_key_if_available
   ```
   Save (Ctrl+X, Y, Enter for nano)

5. **Start Development Mode**
   ```bash
   npm run dev
   ```
   Application will open automatically!

---

### Windows Installation

1. **Open Command Prompt**
   - Press `Win + R`
   - Type `cmd`
   - Press Enter

2. **Navigate to project directory**
   ```bash
   cd C:\Users\YourUsername\Documents\my_job\tiktok_gen_video_sell
   ```
   (Replace YourUsername with your actual username)

3. **Run setup script**
   Double-click: `setup.bat`
   
   OR from command prompt:
   ```bash
   setup.bat
   ```

4. **Configure API Keys**
   - Find `.env` file in project folder
   - Right-click → Open with → Notepad
   - Add your keys:
     ```
     GEMINI_API_KEY=your_actual_key_here
     SORA_API_KEY=your_sora_key_if_available
     ```
   - Save (Ctrl+S)

5. **Start Development Mode**
   In command prompt, run:
   ```bash
   npm run dev
   ```
   Application will open automatically!

---

### Linux Installation

1. **Open Terminal**

2. **Navigate to project**
   ```bash
   cd /path/to/tiktok_gen_video_sell
   ```

3. **Run setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

4. **Configure API Keys**
   ```bash
   nano .env
   # Add your API keys
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

---

## Getting Your API Key

### Google Gemini API (Free & Easy)

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"** button
3. Copy the generated key
4. Paste into `.env` file:
   ```
   GEMINI_API_KEY=sk_test_YourKeyHere1234567890
   ```

**Free Tier Includes:**
- 60 requests per minute
- 1,500 requests per day
- Perfect for testing

---

## Verify Installation

After setup, test that everything works:

1. **Verify Dependencies Installed**
   ```bash
   npm list --depth=0
   ```
   Should show all packages installed.

2. **Check .env Configuration**
   ```bash
   # On macOS/Linux
   cat .env
   
   # On Windows (PowerShell)
   type .env
   ```
   Should show your API keys.

3. **Start Application**
   ```bash
   npm run dev
   ```
   - React dev server starts on http://localhost:3000
   - Electron app window opens
   - DevTools shows in bottom

---

## Troubleshooting Installation

### "Node.js is not installed"

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

**Windows:**
- Download from https://nodejs.org/
- Run installer
- Accept defaults
- Restart command prompt

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

---

### "npm: command not found"

- Restart terminal/command prompt
- Verify installation: `npm -v`
- If still not found, reinstall Node.js

---

### "Module not found" error

```bash
# Delete and reinstall
rm -rf node_modules package-lock.json    # macOS/Linux
rmdir /s node_modules                     # Windows

npm install
```

---

### ".env file not created"

Manually create it:

**macOS/Linux:**
```bash
cp .env.example .env
nano .env
# Add your API keys
```

**Windows:**
- Copy `.env.example`
- Paste in same folder
- Rename to `.env`
- Edit with Notepad

---

### "GEMINI_API_KEY not found" at runtime

1. Check `.env` exists: `cat .env`
2. Verify key is there: `GEMINI_API_KEY=sk_...`
3. No spaces around `=`: `KEY=value` not `KEY = value`
4. Restart application after changing `.env`
5. For npm run dev: Wait for React to fully start

---

### Port 3000 already in use

Another app is using port 3000:

**macOS/Linux:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process (replace PID)
kill -9 <PID>
```

**Windows (PowerShell as Admin):**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id <PID> -Force
```

---

### Electron won't start

Check main.js errors:
```bash
npm run dev 2>&1 | grep -i "error"
```

Common issues:
- Node version too old: upgrade to 14+
- Missing main.js or preload.js
- Incorrect file paths (use absolute paths)

---

## Project Structure After Installation

```
tiktok_gen_video_sell/
├── node_modules/          # Dependencies (created by npm install)
├── public/                # Static files
│   └── index.html
├── src/
│   ├── components/        # React components
│   │   ├── App.js
│   │   ├── Dashboard.js
│   │   ├── TikTokForm.js
│   │   ├── CaptionGenerator.js
│   │   ├── SoraVideoGenerator.js
│   │   ├── ProgressTracker.js
│   │   └── App.css
│   ├── services/          # Backend services
│   │   ├── tiktokExtractor.js
│   │   ├── geminiService.js
│   │   └── soraAutomation.js
│   ├── styles/            # Component styles
│   ├── index.js           # React entry point
│   └── index.css
├── .env                   # API keys (your secrets)
├── .env.example          # Template
├── .gitignore            # Git ignore rules
├── main.js               # Electron main process
├── preload.js            # Security bridge
├── package.json          # Dependencies & scripts
├── README.md             # Project documentation
├── QUICKSTART.md         # Quick start guide
├── DEVELOPMENT.md        # Development guide
├── setup.sh              # Setup script (macOS/Linux)
└── setup.bat             # Setup script (Windows)
```

---

## First Run Checklist

- [ ] Node.js 14+ installed
- [ ] npm installed correctly
- [ ] setup.bat/setup.sh ran successfully
- [ ] .env file created with API key
- [ ] Dependencies installed (npm install completed)
- [ ] Application starts with `npm run dev`
- [ ] React dev server starts on localhost:3000
- [ ] Electron window opens

---

## What's Next?

After successful installation:

1. **Test Application**
   - Enter a valid TikTok URL
   - Watch data extraction
   - Generate a caption
   - Try Sora integration

2. **Customize**
   - Edit components in src/components/
   - Modify styles in src/styles/
   - Add new features following DEVELOPMENT.md

3. **Build for Distribution**
   ```bash
   npm run build-mac   # For macOS
   npm run build-win   # For Windows
   ```

---

## Getting Help

### Check Documentation
- **Quick Start**: QUICKSTART.md
- **Development**: DEVELOPMENT.md
- **Main README**: README.md

### Common Questions
1. Where do I add my API key? → In `.env` file
2. Why won't it start? → Check prerequisites
3. What if TikTok extraction fails? → Verify URL format
4. Can I use short URLs? → No, use full URLs only

### Before Reporting Issues
1. Verify all prerequisites installed
2. Run setup script again
3. Delete node_modules and reinstall
4. Check console for error messages
5. Verify .env configuration

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development (recommended)
npm run dev

# Start production
npm start

# Build React
npm run react-build

# Build for macOS
npm run build-mac

# Build for Windows
npm run build-win

# Package only (no installer)
npm run pack
```

---

## Success Indicators

✓ Application starts without errors
✓ React dev server running on http://localhost:3000
✓ Electron window opens and displays UI
✓ Can enter TikTok URL
✓ No API key errors in console
✓ Progress tracker shows on right sidebar

---

Version: 1.0.0
Last Updated: February 2026
Support: Check README.md & DEVELOPMENT.md for detailed guides
