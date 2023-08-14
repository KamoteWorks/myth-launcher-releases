// preload.ts
const { contextBridge, ipcRenderer } = require('electron');
import * as dotenv from 'dotenv';
dotenv.config();

// Expose functions and ipcRenderer to the renderer process
contextBridge.exposeInMainWorld('electron', {
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  launchGame: () => ipcRenderer.send('launch-executable'),
  repairGameFiles: () => ipcRenderer.send('repair-game-files'),
  downloadGameFiles: () => ipcRenderer.send('download-game-files'),
  checkClient: (user: string, pass: string) =>
    ipcRenderer.send('check-client', user, pass),
  tryUpdate: () => ipcRenderer.send('try-update'),
  comingSoon: () => ipcRenderer.send('coming-soon'),
  getApiInfo: () => {
    return {
      apiUrl: process.env.MYTH_GAMES_APIURL,
    };
  },
  ipcRenderer: {
    sendMessage(channel: string, args: any) {
      ipcRenderer.send(channel, args);
    },
    on(channel: string, func: any) {
      const subscription = (_event: any, ...args: any[]) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: string, func: any) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
