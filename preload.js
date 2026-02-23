const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  extractTiktokData: (url) => ipcRenderer.invoke('extract-tiktok-data', url),
  generateCaption: (content) => ipcRenderer.invoke('generate-caption', content),
  generateSoraPrompt: (content) => ipcRenderer.invoke('generate-sora-prompt', content),
  createSoraVideo: (data) => ipcRenderer.invoke('create-sora-video', data),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  onTiktokDataReceived: (callback) => ipcRenderer.on('tiktok-data-received', callback),
  onVideoCreated: (callback) => ipcRenderer.on('video-created', callback),
});
