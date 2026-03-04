const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');
require('dotenv').config();

let autoUpdater = null;

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
  const fs = require('fs');
  const iconPath = path.join(__dirname, 'icon.png');
  const iconExists = fs.existsSync(iconPath);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 },
    icon: iconExists ? iconPath : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.platform === 'darwin' && iconExists) {
    app.dock.setIcon(iconPath);
  }

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

// ── Auto-updater setup ──
function setupAutoUpdater() {
  try {
    autoUpdater = require('electron-updater').autoUpdater;
  } catch (e) {
    console.warn('[updater] electron-updater not available:', e.message);
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    console.log('[updater] Update available:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', info);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[updater] Update downloaded:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-downloaded', info);
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater] Error:', err.message);
  });

  // Only check for updates in production
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

app.on('ready', () => {
  createWindow();
  setupAutoUpdater();
});

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

ipcMain.handle('create-sora-video', async (event, { imageData, prompt, characterId, resolution, duration, videoCount }) => {
  try {
    const soraAutomation = require('./src/services/soraAutomation');
    const options = { characterId, resolution, duration, videoCount };
    console.log('[main] Starting Sora submission with options:', options);

    // Relay progress events to renderer
    const progressHandler = (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('sora-progress', data);
      }
    };
    soraAutomation.on('progress', progressHandler);

    const result = await soraAutomation.createVideoWithCharacter(imageData, prompt, options);

    // Clean up listener
    soraAutomation.removeListener('progress', progressHandler);

    console.log('[main] Submission result:', result.success ? 'Success' : `Failed (NeedLogin: ${!!result.needLogin})`);
    return result;
  } catch (error) {
    console.error('[main] Submission error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('poll-sora-result', async (event) => {
  try {
    const soraAutomation = require('./src/services/soraAutomation');
    const result = await soraAutomation.pollForVideoResult();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-video', async (event, { url, filename }) => {
  try {
    const fs = require('fs-extra');
    const os = require('os');
    const path = require('path');

    const downloadDir = path.join(os.homedir(), 'Downloads', 'TikTokGenVideos');
    await fs.ensureDir(downloadDir);

    const filePath = path.join(downloadDir, filename || `video_${Date.now()}.mp4`);
    const actualUrl = Array.isArray(url) ? url[0] : url;

    if (!actualUrl) {
      return { success: false, error: 'No video URL provided' };
    }

    // Sora page link (trang chứa video) - cần dùng Puppeteer để lấy video thật
    const isSoraPage = /sora\.chatgpt\.com\/(d\/|v\/|profile)/.test(actualUrl);

    if (isSoraPage) {
      const soraAutomation = require('./src/services/soraAutomation');
      const result = await soraAutomation.downloadVideoFromPage(actualUrl, filePath);
      return result;
    }

    // Link .mp4 trực tiếp - dùng fetch
    const fetch = require('node-fetch');
    console.log(`Downloading video from ${actualUrl} to ${filePath}...`);
    const response = await fetch(actualUrl);
    if (!response.ok) throw new Error(`Failed to download: ${response.statusText}`);

    const buffer = await response.buffer();
    await fs.writeFile(filePath, buffer);

    return { success: true, filePath };
  } catch (error) {
    console.error('Download error:', error);
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

// ── History IPC Handlers ──
ipcMain.handle('save-history', (event, entry) => {
  const history = store.get('videoHistory', []);
  history.unshift({ ...entry, id: Date.now().toString() });
  // Keep max 50 entries
  if (history.length > 50) history.length = 50;
  store.set('videoHistory', history);
  return { success: true };
});

ipcMain.handle('load-history', () => {
  return store.get('videoHistory', []);
});

ipcMain.handle('delete-history', (event, id) => {
  const history = store.get('videoHistory', []);
  const filtered = history.filter(h => h.id !== id);
  store.set('videoHistory', filtered);
  return { success: true };
});

ipcMain.handle('clear-history', () => {
  store.set('videoHistory', []);
  return { success: true };
});

// ── Auto-update IPC Handlers ──
ipcMain.handle('install-update', () => {
  if (autoUpdater) {
    autoUpdater.quitAndInstall();
  }
});

ipcMain.handle('check-for-updates', async () => {
  if (!autoUpdater) {
    return { success: false, error: 'Auto-updater not available in dev mode' };
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, version: result?.updateInfo?.version };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
