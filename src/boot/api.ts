import axios from 'axios';

// Capability detection flags
export const hasBackend = process.env.MODE !== 'spa';
export const hasFileSystem = process.env.MODE === 'electron'; // SSR might have it but via API, Electron has it via IPC/Local Node

// In Electron, we talk to the internal server on 3001
// In SSR, we use relative URL / to talk to the same server
const baseURL = (process.env.MODE === 'electron' && process.env.CLIENT) 
  ? 'http://127.0.0.1:3001' 
  : '/';

const api = axios.create({ baseURL });

export { api };
export default api;
