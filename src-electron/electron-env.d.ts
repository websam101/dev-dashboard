declare namespace NodeJS {
  interface ProcessEnv {
    QUASAR_PUBLIC_FOLDER: string;
    QUASAR_ELECTRON_PRELOAD_FOLDER: string;
    QUASAR_ELECTRON_PRELOAD_EXTENSION: string;
    APP_URL: string;
  }
}

export interface ElectronApi {
  selectFolder: () => Promise<string | null>;
  exportBookmarks: (data: string) => Promise<boolean>;
  importBookmarks: () => Promise<string | null>;
}

declare global {
  interface Window {
    electronApi: ElectronApi;
  }
}
