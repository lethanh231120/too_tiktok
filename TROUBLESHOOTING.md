y# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## Installation Issues

### ❌ "Node.js is not installed"

**Problem**: Command `node` not found

**Solution**:
1. Download from https://nodejs.org/ (LTS version)
2. Run installer and follow steps
3. Restart terminal/command prompt
4. Verify: `node -v` should show version

**macOS Homebrew**:
```bash
brew install node
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install nodejs npm
```

---

### ❌ "npm: command not found"

**Problem**: npm not recognized as command

**Solutions**:
- Restart terminal after Node.js installation
- Verify installation: `npm -v`
- Reinstall Node.js if still failing
- Check PATH environment variable

---

### ❌ "npm install fails with errors"

**Problem**: Dependency installation fails

**Solutions**:
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules          # macOS/Linux
rmdir /s node_modules        # Windows

# Reinstall
npm install
```

If still failing:
- Check internet connection
- Disable VPN temporarily
- Check disk space (needs ~500MB)

---

### ❌ "Module 'puppeteer' not found"

**Problem**: Missing dependency after install

**Solution**:
```bash
# Reinstall specific package
npm install puppeteer

# Or reinstall everything
npm install --legacy-peer-deps
```

---

## Configuration Issues

### ❌ "GEMINI_API_KEY is not defined"

**Problem**: Application says API key is missing

**Solution**:
1. Check `.env` file exists
2. Open it and verify content:
   ```
   GEMINI_API_KEY=sk_test_YOUR_KEY_HERE
   ```
3. No spaces around `=`
4. Restart application after edit

**Verify .env exists**:
```bash
ls -la .env              # macOS/Linux
dir .env                 # Windows
```

---

### ❌ "Invalid API key"

**Problem**: API key is wrong or expired

**Solutions**:
1. Go to https://makersuite.google.com/app/apikey
2. Check if key is still active
3. Delete old key and create new one
4. Copy full key (no extra spaces)
5. Update .env file
6. Restart application

**Verify key format**:
- Should start with: `sk_`
- Should be ~40+ characters
- No spaces or quotes

---

### ❌ ".env file not created"

**Problem**: No .env file in project folder

**Solution**:

**macOS/Linux**:
```bash
cp .env.example .env
nano .env
# Add your API key, save with Ctrl+X, Y, Enter
```

**Windows**:
1. Find `.env.example` in folder
2. Copy and paste
3. Rename copy to `.env`
4. Right-click → Edit with Notepad
5. Add your API key
6. Save (Ctrl+S)

---

## Application Launch Issues

### ❌ "Application won't start"

**Problem**: App crashes or doesn't open

**Solutions**:
1. Check Node version: `node -v` (should be 14+)
2. Verify dependencies: `npm list --depth=0`
3. Clear cache: `npm cache clean --force`
4. Reinstall: `npm install`
5. Check main.js for syntax errors
6. Try production mode: `npm start`

---

### ❌ "Electron window doesn't open"

**Problem**: Electron launches but window doesn't appear

**Solutions**:
1. Check file paths are absolute in main.js
2. Verify preload.js exists
3. Check console for errors: `npm run dev 2>&1 | head -50`
4. Try simpler version: just use `npm start`

**Debug**:
```bash
# Check for errors
npm run dev > error.log 2>&1
cat error.log
```

---

### ❌ "Port 3000 already in use"

**Problem**: "Address already in use" error

**Solution**:

**macOS/Linux**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill it (replace PID with actual number)
kill -9 <PID>
```

**Windows (PowerShell as Admin)**:
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id <PID> -Force
```

Alternative: Use different port
```bash
PORT=3001 npm run dev
```

---

### ❌ "React not loading at localhost:3000"

**Problem**: Blank page or error at localhost:3000

**Solutions**:
1. Check React server is running (check console)
2. Hard refresh browser: `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows)
3. Check for React errors in browser console (F12)
4. Verify index.html exists in public/
5. Check index.js in src/

---

## Runtime Issues

### ❌ "Invalid TikTok URL"

**Problem**: URL rejected during extraction

**Valid formats**:
```
✓ https://www.tiktok.com/@username/video/123456789
✓ https://www.tiktok.com/@user_name/video/7098765432
```

**Invalid formats**:
```
✗ https://vm.tiktok.com/... (short link)
✗ https://www.tiktok.com/explore (non-video)
✗ tiktok.com/@user/video/123 (missing https://)
✗ https://www.tiktok.com/@user (no video/)
```

**Solution**: Use full URL from TikTok app:
1. Open TikTok video
2. Click share
3. Copy link
4. Paste full URL

---

### ❌ "Cannot extract TikTok data"

**Problem**: Extraction fails with timeout or network error

**Possible causes**:
- Internet connection down
- TikTok page not loading
- Video is private/restricted
- Rate limiting (wait a minute)
- Regional blocking

**Solutions**:
1. Check internet connection
2. Try different TikTok video
3. Wait 1-2 minutes before retry
4. Check if video is public
5. Disable VPN if using one

---

### ❌ "Image download fails"

**Problem**: Can't download thumbnail image

**Solutions**:
1. Check internet connection
2. Verify TikTok URL is valid
3. Try different video
4. Check disk space (needs ~10MB temp)
5. Check firewall allows downloads

---

### ❌ "Gemini API rate limited"

**Problem**: "Too many requests" error

**Reason**: Free tier limit = 60 requests/minute

**Solutions**:
1. Wait 1-2 minutes
2. Try again with different video
3. Upgrade API plan at Google AI Studio
4. Space out requests (1 second apart)

---

### ❌ "Browser won't open for Sora"

**Problem**: Sora automation fails, browser doesn't open

**Solutions**:
1. Check browser (Chrome) installed
2. Disable popup blocker
3. Check firewall settings
4. Verify internet connection
5. Check Sora website is accessible
6. Try manual navigation: https://sora.chatgpt.com

**Debug**:
```bash
# Check if Chrome/Chromium installed
which chromium          # macOS/Linux
where chromium.exe      # Windows
```

---

### ❌ "Sora character selection doesn't work"

**Problem**: Can't select character vuluu2k.thao

**Solutions**:
1. Verify character ID spelling: `vuluu2k.thao`
2. Character may not be available
3. Website structure may have changed
4. Try manual selection in browser
5. Check browser console for errors

**Alternative**: Let user select manually
- Application will open browser
- User can select character manually

---

## Performance Issues

### ❌ "Application runs slowly"

**Possible causes**:
- Large image files
- Slow internet connection
- Background apps using CPU
- Not enough RAM

**Solutions**:
1. Close other applications
2. Restart computer
3. Clear temp files: `rm -rf temp/`
4. Check available RAM (needs ~500MB)
5. Use wired internet instead of WiFi

---

### ❌ "Extraction/Generation is slow"

**Reasons**:
- API servers are slow
- Network connection slow
- Large image files
- Rate limiting

**Solutions**:
1. Check internet speed
2. Try during off-peak hours
3. Use wired connection
4. Restart router
5. Check system resources

---

## Platform-Specific Issues

### 🍎 macOS Issues

#### "App can't be opened because Apple cannot check it"

**Solution**:
1. System Preferences → Security & Privacy
2. Click "Open Anyway"
3. Or: `xattr -d com.apple.quarantine app_name`

#### "Permission denied" for setup.sh

**Solution**:
```bash
chmod +x setup.sh
./setup.sh
```

---

### 🪟 Windows Issues

#### "Windows protected your PC"

**Solution**:
1. Click "More info"
2. Click "Run anyway"
3. Or: Run as Administrator

#### "cmd.exe is not recognized"

**Solution**:
- Use PowerShell instead
- Or full path: `C:\Windows\System32\cmd.exe`

#### Setup.bat won't run

**Solutions**:
1. Right-click → Run as Administrator
2. Or open cmd as admin, then run: `setup.bat`

---

### 🐧 Linux Issues

#### "Permission denied" when running npm

**Solution**:
- Don't use `sudo npm`
- Fix npm permissions:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  export PATH=~/.npm-global/bin:$PATH
  ```

#### Electron window issues

**Solutions**:
1. Install missing libraries: `sudo apt install libxss1`
2. Use headless mode if X11 unavailable
3. Check display: `echo $DISPLAY`

---

## File & Permission Issues

### ❌ "Permission denied" errors

**macOS/Linux**:
```bash
# Fix permissions
chmod 755 setup.sh
chmod 644 .env
chmod 755 -R src/
```

**Windows**: Run as Administrator

---

### ❌ "Cannot write to file"

**Problem**: "Permission denied" when saving

**Solutions**:
1. Check file isn't read-only (macOS: press I on file)
2. Run with administrator (Windows)
3. Check folder permissions
4. Ensure disk isn't full

---

### ❌ "Too many files open"

**Problem**: "EMFILE: too many open files"

**Solution**:
```bash
# macOS/Linux
ulimit -n 4096
```

---

## API & Network Issues

### ❌ "Network request timeout"

**Causes**:
- Slow internet
- API server down
- Firewall blocking
- DNS issues

**Solutions**:
1. Check internet connection: `ping google.com`
2. Check DNS: `nslookup google.com`
3. Try different network
4. Disable VPN
5. Increase timeout in code

---

### ❌ "CORS errors"

**Problem**: API request blocked by CORS

**Solution**: This shouldn't happen (Gemini API is configured)
- If occurs, might indicate network proxy
- Disable proxy/VPN
- Check firewall settings

---

## Getting Help

### Before Asking for Help

1. ✓ Read the relevant documentation
   - QUICKSTART.md
   - INSTALLATION.md
   - DEVELOPMENT.md

2. ✓ Check this troubleshooting guide

3. ✓ Try basic solutions:
   - Restart application
   - Reinstall dependencies (`npm install`)
   - Check error messages in console (F12)

4. ✓ Gather information:
   - Your OS (Windows/Mac/Linux)
   - Node/npm versions
   - Complete error message
   - Steps you took

### Where to Find Help

1. **Error messages**: Search exact message online
2. **API questions**: See QUICKSTART.md
3. **Installation**: See INSTALLATION.md
4. **Development**: See DEVELOPMENT.md
5. **General**: See README.md

---

## Debug Checklist

When something goes wrong:

- [ ] Check internet connection
- [ ] Verify API key in .env
- [ ] Check Node.js version: `node -v`
- [ ] Look at browser console: F12
- [ ] Look at terminal output
- [ ] Try restarting application
- [ ] Try `npm install` again
- [ ] Check file permissions
- [ ] Disable VPN/proxy
- [ ] Free up disk space
- [ ] Check firewall settings

---

## Emergency Solutions

If nothing works:

1. **Full Clean Install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

2. **Reset Configuration**
   ```bash
   rm .env
   cp .env.example .env
   # Add API key again
   ```

3. **Restart Everything**
   - Close application
   - Close terminal
   - Restart computer
   - Try again

4. **Create New Project Folder**
   - Copy project to new location
   - Run setup in new folder
   - Try again

---

## Still Having Issues?

1. Check all documentation files
2. Review error messages carefully
3. Try different TikTok videos
4. Try different API keys
5. Test on different device if available

---

Version: 1.0.0
Last Updated: February 2026

Good luck! 🚀
