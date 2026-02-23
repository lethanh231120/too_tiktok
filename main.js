const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
require('dotenv').config();

// Polyfill: Electron main process doesn't have browser's File API,
// but axios v1.6+ references it. Provide a stub to prevent ReferenceError.
if (typeof globalThis.File === 'undefined') {
  globalThis.File = class File {
    constructor(bits, name, options) {
      this.bits = bits;
      this.name = name;
      this.options = options;
    }
  };
}

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('extract-tiktok-data', async (event, tiktokUrl) => {
  try {
    const tiktokExtractor = require('./src/services/tiktokExtractor');
    console.log('[main] Calling extractTikTokData with:', tiktokUrl);
    const data = await tiktokExtractor.extractTikTokData(tiktokUrl);
    console.log('[main] Success:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (error) {
    console.error('[main] Error in extract-tiktok-data:', error.message);
    console.error('[main] Stack:', error.stack);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('generate-caption', async (event, content) => {
  try {
    const geminiService = require('./src/services/geminiService');
    const caption = await geminiService.generateCaption(content);
    return { success: true, caption };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('generate-sora-prompt', async (event, content) => {
  try {
    const geminiService = require('./src/services/geminiService');
    const prompt = await geminiService.generateSoraPrompt(content);
    return { success: true, prompt };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-sora-video', async (event, { imageData, prompt, characterId }) => {
  try {
    const soraAutomation = require('./src/services/soraAutomation');
    const result = await soraAutomation.createVideoWithCharacter(imageData, prompt, characterId);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-config', (event, config) => {
  store.set('config', config);
  return { success: true };
});

ipcMain.handle('load-config', () => {
  return store.get('config', {});
});

ipcMain.handle('open-sora-login', async () => {
  const soraAutomation = require('./src/services/soraAutomation');
  const browser = await soraAutomation.initBrowser();
  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  await page.goto('https://sora.chatgpt.com', { waitUntil: 'networkidle2' });
  return { success: true };
});

ipcMain.handle('close-sora-browser', async () => {
  const soraAutomation = require('./src/services/soraAutomation');
  await soraAutomation.closeBrowser();
  return { success: true };
});
