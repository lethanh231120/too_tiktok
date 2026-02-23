# Development Guide

## Project Architecture

```
Electron App
├─ Main Process (main.js)
│  ├─ IPC Handlers
│  ├─ File I/O
│  └─ API Calls
│
├─ Renderer Process (React)
│  ├─ Components
│  ├─ Styling
│  └─ User Interactions
│
└─ Services
   ├─ TikTok Extractor
   ├─ Gemini Service
   └─ Sora Automation
```

## Development Workflow

### 1. Start Development Server
```bash
npm run dev
```
This:
- Starts React dev server on port 3000
- Launches Electron app
- Opens DevTools automatically
- Hot-reloads on file changes

### 2. Making Changes

#### Frontend Changes (React)
- Edit files in `src/components/`
- Changes hot-reload automatically
- No restart needed

#### Backend Changes (Node.js)
- Edit files in `src/services/` or `main.js`
- Restart required
- Close app and run `npm run dev` again

### 3. Testing

#### Test TikTok URLs
```
https://www.tiktok.com/@tiktok/video/7123456789012345678
https://www.tiktok.com/@cristiano/video/7098765432109876543
```

#### Test Without APIs
Comment out API calls in services to test UI flow.

---

## File Structure Explained

### `main.js`
- Electron main process
- Creates browser window
- Handles IPC events
- Manages app lifecycle

### `preload.js`
- Security context bridge
- Exposes safe APIs to React
- Validates all IPC calls

### `src/services/`
- **tiktokExtractor.js**: Scrapes TikTok data
- **geminiService.js**: Calls Gemini API
- **soraAutomation.js**: Automates Sora with Puppeteer

### `src/components/`
- **App.js**: Root component
- **Dashboard.js**: Main layout & state
- **TikTokForm.js**: URL input
- **CaptionGenerator.js**: Caption generation UI
- **SoraVideoGenerator.js**: Video generation UI
- **ProgressTracker.js**: Progress display

### `src/styles/`
- CSS files for each component
- Global styles in `App.css`

---

## Adding Features

### Add New IPC Handler

1. **In `main.js`:**
```javascript
ipcMain.handle('my-new-function', async (event, arg) => {
  try {
    const result = await myService.doSomething(arg);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

2. **In `preload.js`:**
```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  myNewFunction: (arg) => ipcRenderer.invoke('my-new-function', arg),
});
```

3. **In React Component:**
```javascript
const result = await window.electronAPI.myNewFunction(data);
```

### Add New Service

1. Create file: `src/services/myService.js`
2. Export singleton: `module.exports = new MyService();`
3. Add IPC handler in `main.js`
4. Add preload exposure in `preload.js`
5. Use in React component

---

## Debugging

### Console Output
Development mode shows console in main window.

### DevTools
Press F12 to open DevTools in development mode.

### Useful Debugging
```javascript
// In service files
console.log('Debug:', variable);

// In React components
console.log('State:', state);

// Check IPC calls
console.log('IPC call:', result);
```

### Error Handling
Always wrap API calls in try-catch:
```javascript
try {
  const result = await window.electronAPI.myFunction();
} catch (error) {
  console.error('Error:', error);
  // Handle error gracefully
}
```

---

## Performance Tips

1. **Lazy Load Components**
   - Load components only when needed
   - Current app loads sequentially (good for this size)

2. **Image Optimization**
   - Compress images before storing
   - Delete temp files after use

3. **API Calls**
   - Cache results when possible
   - Implement request debouncing
   - Show loading states

4. **Memory Management**
   - Close browser in Sora automation after use
   - Clean up temp files
   - Unsubscribe from listeners

---

## Building for Production

### macOS
```bash
npm run build-mac
```
Creates:
- `.dmg` installer
- `.zip` portable version

### Windows
```bash
npm run build-win
```
Creates:
- NSIS installer
- Portable `.exe`

### Code Signing (Advanced)
See electron-builder docs for signing apps.

---

## Dependencies Guide

| Package | Purpose | Why Needed |
|---------|---------|-----------|
| electron | Desktop framework | Core requirement |
| react | UI library | Frontend framework |
| axios | HTTP client | API calls |
| puppeteer | Browser automation | Sora automation |
| cheerio | HTML parsing | TikTok data extraction |
| @google/generative-ai | Gemini API | Caption generation |
| electron-store | Data persistence | Save config |

---

## Common Development Issues

### Module not found
```bash
npm install
```

### Electron not starting
- Check main.js syntax
- Verify path references
- Check console output

### React components not showing
- Verify component imports
- Check CSS paths
- Look for React errors in DevTools

### API calls failing
- Check `.env` file
- Verify API key
- Check internet connection
- Look at error response

---

## Testing Checklist

- [ ] TikTok URL extraction works
- [ ] Image downloads
- [ ] Caption generates
- [ ] Caption editable
- [ ] Sora prompt generates
- [ ] Browser opens for Sora
- [ ] Character selection works
- [ ] Progress tracking updates
- [ ] Back buttons work
- [ ] Error handling works
- [ ] Loading states show

---

## Code Style

- Use ES6+ JavaScript
- React functional components with hooks
- CSS Grid/Flexbox for layouts
- Consistent naming: camelCase variables, PascalCase components

---

## Resources

- Electron Docs: https://www.electronjs.org/docs
- React Docs: https://react.dev
- Gemini API: https://makersuite.google.com/
- Puppeteer: https://pptr.dev/
- Sora: https://sora.chatgpt.com

---

## Troubleshooting Development

### "Cannot find module"
- Run `npm install`
- Check import paths
- Restart npm dev server

### "React not rendering"
- Check `src/index.js` entry point
- Verify `public/index.html` has `<div id="root">`
- Check browser console for errors

### "Electron won't start"
- Check main.js syntax
- Verify file paths are absolute
- Check for circular imports

### "Hot reload not working"
- Verify you're in dev mode: `npm run dev`
- Check file paths are correct
- Restart dev server

---

Last Updated: February 2026
