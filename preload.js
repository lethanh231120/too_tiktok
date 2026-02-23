const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  extractTiktokData: (url) => ipcRenderer.invoke('extract-tiktok-data', url),
  generateCaption: (content) => ipcRenderer.invoke('generate-caption', content),
  generateSoraPrompt: (content) => ipcRenderer.invoke('generate-sora-prompt', content),
  createSoraVideo: (data) => ipcRenderer.invoke('create-sora-video', data),
  pollSoraResult: () => ipcRenderer.invoke('poll-sora-result'),
  downloadVideo: (data) => ipcRenderer.invoke('download-video', data),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  openSoraLogin: () => ipcRenderer.invoke('open-sora-login'),
  closeSoraBrowser: () => ipcRenderer.invoke('close-sora-browser'),
  onTiktokDataReceived: (callback) => ipcRenderer.on('tiktok-data-received', callback),
  onVideoCreated: (callback) => ipcRenderer.on('video-created', callback),
});
