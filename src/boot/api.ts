/**
 * Copyright (C) 2025-2026 Sam <websam101@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import axios from 'axios';

// Capability detection flags
export const hasBackend = !['spa', 'bex'].includes(process.env.MODE || '');
export const hasFileSystem = process.env.MODE === 'electron'; // SSR might have it but via API, Electron has it via IPC/Local Node

// In Electron, we talk to the internal server on 3001
// In SSR, we use relative URL / to talk to the same server
const baseURL = (process.env.MODE === 'electron' && process.env.CLIENT) 
  ? 'http://127.0.0.1:3001' 
  : '/';

const api = axios.create({ baseURL });

export { api };
export default api;
