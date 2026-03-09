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
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgnosticDataService } from './AgnosticDataService';
import { api } from '../../boot/api';

vi.mock('./adapter/IndexedDbAdapter', () => {
  return {
    IndexedDbAdapter: class {
      getProjects = vi.fn().mockResolvedValue([]);
      addProject = vi.fn().mockResolvedValue(undefined);
      bulkAddProjects = vi.fn().mockResolvedValue(undefined);
      deleteProject = vi.fn().mockResolvedValue(undefined);
      getSetting = vi.fn().mockResolvedValue(undefined);
      setSetting = vi.fn().mockResolvedValue(undefined);
      getBookmarks = vi.fn().mockResolvedValue([]);
      addBookmark = vi.fn().mockResolvedValue(undefined);
      deleteBookmark = vi.fn().mockResolvedValue(undefined);
      connect = vi.fn().mockResolvedValue(undefined);
      disconnect = vi.fn().mockResolvedValue(undefined);
    }
  };
});

vi.mock('../../boot/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ data: {} }),
    get: vi.fn().mockResolvedValue({ data: {} }),
  },
  hasBackend: true,
}));

describe('AgnosticDataService', () => {
  let service: any;
  let mockLocal: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AgnosticDataService();
    mockLocal = service.local;
  });

  it('gets projects from local adapter', async () => {
    const mockProjects = [{ id: '1', name: 'P1' }];
    mockLocal.getProjects.mockResolvedValue(mockProjects);

    const result = await service.getProjects();
    expect(result).toEqual(mockProjects);
    expect(mockLocal.getProjects).toHaveBeenCalled();
  });

  it('saves project locally and syncs to backend when hasBackend is true', async () => {
    const project = { id: '1', name: 'P1' };
    service.hasBackend = true;

    await service.saveProject(project as any);

    expect(mockLocal.addProject).toHaveBeenCalledWith(project);
    expect(api.post).toHaveBeenCalledWith('/api/projects/update', project);
  });

  it('saves project locally but NOT to backend when hasBackend is false', async () => {
    const project = { id: '1', name: 'P1' };
    service.hasBackend = false;

    await service.saveProject(project as any);

    expect(mockLocal.addProject).toHaveBeenCalledWith(project);
    expect(api.post).not.toHaveBeenCalled();
  });

  it('deletes project locally and syncs to backend when hasBackend is true', async () => {
    const id = '1';
    service.hasBackend = true;

    await service.deleteProject(id);

    expect(mockLocal.deleteProject).toHaveBeenCalledWith(id);
    expect(api.post).toHaveBeenCalledWith('/api/projects/remove', { id });
  });

  it('gets settings from local adapter', async () => {
    const mockSettings = { darkMode: true };
    mockLocal.getSetting.mockResolvedValue(mockSettings);

    const result = await service.getSetting('app_settings');
    expect(result).toEqual(mockSettings);
    expect(mockLocal.getSetting).toHaveBeenCalledWith('app_settings');
  });

  it('sets setting locally and syncs to backend for app_settings', async () => {
    const settings = { darkMode: true };
    service.hasBackend = true;

    await service.setSetting('app_settings', settings);

    expect(mockLocal.setSetting).toHaveBeenCalledWith('app_settings', settings);
    expect(api.post).toHaveBeenCalledWith('/api/settings', settings);
  });

  it('sets setting locally but NOT to backend if NOT app_settings', async () => {
    const other = { some: 'data' };
    service.hasBackend = true;

    await service.setSetting('other_key', other);

    expect(mockLocal.setSetting).toHaveBeenCalledWith('other_key', other);
    expect(api.post).not.toHaveBeenCalled();
  });
});
