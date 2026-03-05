import si from 'systeminformation';
import os from 'node:os';

export interface SystemStats {
  cpuLoad: number;
  memTotal: number;
  memUsed: number;
  memPercent: number;
  diskTotal: number;
  diskUsed: number;
  diskPercent: number;
  uptime: number;
  platform: string;
}

export class SystemMonitor {
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<T>((resolve) => {
      timeoutId = setTimeout(() => resolve(fallback), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });
  }

  async getStats(): Promise<SystemStats> {
    try {
      // Use native 'os' module for CPU/RAM as it's near-instant and never hangs
      const freeMem = os.freemem();
      const totalMem = os.totalmem();
      const usedMem = totalMem - freeMem;
      const memPercent = Math.round((usedMem / totalMem) * 100);

      // CPU load from 'os' is an average, let's try 'si' but with a very aggressive timeout
      const cpu = await this.withTimeout(si.currentLoad(), 1000, { currentLoad: 0 } as si.Systeminformation.CurrentLoadData);
      
      // Disk is the most likely to hang (network drives, sleeping HDDs)
      const disk = await this.withTimeout(si.fsSize(), 800, [] as si.Systeminformation.FsSizeData[]);

      const mainDisk = Array.isArray(disk) && disk.length > 0 
        ? (disk.find(d => d.mount === '/' || d.mount === 'C:') || disk[0])
        : null;

      // Add Memory usage via native OS as final verification
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;

      return {
        cpuLoad: Math.round(cpu.currentLoad || 0),
        memTotal: Math.round(totalMem / (1024 ** 3) * 100) / 100,
        memUsed: Math.round(usedMem / (1024 ** 3) * 100) / 100,
        memPercent: Math.round((usedMem / totalMem) * 100),
        diskTotal: mainDisk ? Math.round(mainDisk.size / (1024 ** 3) * 100) / 100 : 0,
        diskUsed: mainDisk ? Math.round(mainDisk.used / (1024 ** 3) * 100) / 100 : 0,
        diskPercent: mainDisk ? Math.round(mainDisk.use) : 0,
        uptime: Math.round(os.uptime()),
        platform: process.platform
      };
    } catch (e) {
      console.error('SystemMonitor Critical Failure:', e);
      return {
        cpuLoad: 0,
        memTotal: Math.round(os.totalmem() / (1024 ** 3) * 100) / 100,
        memUsed: Math.round((os.totalmem() - os.freemem()) / (1024 ** 3) * 100) / 100,
        memPercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
        diskTotal: 0, diskUsed: 0, diskPercent: 0, 
        uptime: Math.round(os.uptime()), 
        platform: process.platform
      };
    }
  }
}
