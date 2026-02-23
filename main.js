const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

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

  // Load a simple HTML file instead of React dev server
  mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

  mainWindow.webContents.openDevTools();
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
    const data = await tiktokExtractor.extractTikTokData(tiktokUrl);
    return { success: true, data };
  } catch (error) {
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
