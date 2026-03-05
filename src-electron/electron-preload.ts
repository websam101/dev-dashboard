import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronApi', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
});
