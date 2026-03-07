import axios from 'axios';

// In Electron, we talk to the internal server on 3001
// In SSR, we use relative URL / to talk to the same server
const baseURL = (process.env.MODE === 'electron' && process.env.CLIENT) 
  ? 'http://127.0.0.1:3001' 
  : '/';

const api = axios.create({ baseURL });

export { api };
export default api;
