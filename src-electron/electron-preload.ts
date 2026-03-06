import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronApi', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  exportBookmarks: (data: string) => ipcRenderer.invoke('export-bookmarks', data),
  importBookmarks: () => ipcRenderer.invoke('import-bookmarks'),
});
