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
    mockLocal = (service as any).local;
  });

  it('gets projects from local adapter', async () => {
    const mockProjects = [{ id: '1', name: 'P1' }];
    mockLocal.getProjects.mockResolvedValue(mockProjects);

    const result = await service.getProjects();
    expect(result).toEqual(mockProjects);
    expect(mockLocal.getProjects).toHaveBeenCalled();
  });

  it('saves project locally and syncs to backend when hasBackend is true', async () => {
    const project = { id: '1', name: 'P1' } as any;
    (service as any).hasBackend = true;

    await service.saveProject(project);

    expect(mockLocal.addProject).toHaveBeenCalledWith(project);
    expect(api.post).toHaveBeenCalledWith('/api/projects/update', project);
  });

  it('saves project locally but NOT to backend when hasBackend is false', async () => {
    const project = { id: '1', name: 'P1' } as any;
    (service as any).hasBackend = false;

    await service.saveProject(project);

    expect(mockLocal.addProject).toHaveBeenCalledWith(project);
    expect(api.post).not.toHaveBeenCalled();
  });

  it('deletes project locally and syncs to backend when hasBackend is true', async () => {
    const id = '1';
    (service as any).hasBackend = true;

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
    (service as any).hasBackend = true;

    await service.setSetting('app_settings', settings);

    expect(mockLocal.setSetting).toHaveBeenCalledWith('app_settings', settings);
    expect(api.post).toHaveBeenCalledWith('/api/settings', settings);
  });

  it('sets setting locally but NOT to backend if NOT app_settings', async () => {
    const other = { some: 'data' };
    (service as any).hasBackend = true;

    await service.setSetting('other_key', other);

    expect(mockLocal.setSetting).toHaveBeenCalledWith('other_key', other);
    expect(api.post).not.toHaveBeenCalled();
  });
});
