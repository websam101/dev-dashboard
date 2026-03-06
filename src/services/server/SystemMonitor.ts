import si from 'systeminformation';
import os from 'node:os';

export interface SystemStats {
  cpuLoad: number;
  cpuCores: number;
  memTotal: number;
  memUsed: number;
  memPercent: number;
  diskTotal: number;
  diskUsed: number;
  diskPercent: number;
  loadAvg: number[];
  netSent: number;
  netRecv: number;
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
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);
    const platform = process.platform;
    const uptime = Math.round(os.uptime());
    const cpuCores = os.cpus().length;
    
    // On Windows, os.loadavg() is [0,0,0]. 
    // We'll try to get si.currentLoad() which has some load info or use CPU as proxy
    let loadAvg = os.loadavg();

    try {
      const cpu = await this.withTimeout(si.currentLoad(), 2000, { currentLoad: 0, avgLoad: 0 } as si.Systeminformation.CurrentLoadData);
      const disk = await this.withTimeout(si.fsSize(), 2000, [] as si.Systeminformation.FsSizeData[]);
      const net = await this.withTimeout(si.networkStats(), 2000, [] as si.Systeminformation.NetworkStatsData[]);

      // If loadAvg is all zeros (Windows), use SI's currentLoad as a proxy for the 1m load
      if (platform === 'win32' && loadAvg.every(v => v === 0)) {
        const current = (cpu.currentLoad || 0) / 100 * cpuCores;
        // Mocking 5m and 15m based on current for UI consistency on Windows
        loadAvg = [
          Math.round(current * 100) / 100,
          Math.round(current * 0.8 * 100) / 100,
          Math.round(current * 0.7 * 100) / 100
        ];
      }

      const mainDisk = Array.isArray(disk) && disk.length > 0 
        ? (disk.find(d => d.mount === '/' || d.mount === 'C:') || disk[0])
        : null;

      let totalSent = 0;
      let totalRecv = 0;
      if (Array.isArray(net)) {
        net.forEach(iface => {
          totalSent += (iface.tx_bytes || 0);
          totalRecv += (iface.rx_bytes || 0);
        });
      }

      return {
        cpuLoad: Math.round(cpu.currentLoad || 0),
        cpuCores,
        memTotal: Math.round(totalMem / (1024 ** 3) * 100) / 100,
        memUsed: Math.round(usedMem / (1024 ** 3) * 100) / 100,
        memPercent: memPercent,
        diskTotal: mainDisk ? Math.round(mainDisk.size / (1024 ** 3) * 100) / 100 : 0,
        diskUsed: mainDisk ? Math.round(mainDisk.used / (1024 ** 3) * 100) / 100 : 0,
        diskPercent: mainDisk ? Math.round(mainDisk.use) : 0,
        loadAvg,
        netSent: Math.round(totalSent / (1024 ** 2) * 100) / 100,
        netRecv: Math.round(totalRecv / (1024 ** 2) * 100) / 100,
        uptime,
        platform
      };
    } catch (e) {
      return {
        cpuLoad: 0,
        cpuCores,
        memTotal: Math.round(totalMem / (1024 ** 3) * 100) / 100,
        memUsed: Math.round(usedMem / (1024 ** 3) * 100) / 100,
        memPercent: memPercent,
        diskTotal: 0, 
        diskUsed: 0, 
        diskPercent: 0,
        loadAvg: [0, 0, 0],
        netSent: 0,
        netRecv: 0,
        uptime,
        platform
      };
    }
  }
}
