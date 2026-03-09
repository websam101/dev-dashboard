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
  private lastStats: SystemStats | null = null;
  private lastFetchTime = 0;
  private isFetching = false;

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
    const now = Date.now();
    
    // 1. Return cached stats if fetched within the last 5 seconds
    if (this.lastStats && (now - this.lastFetchTime < 5000)) {
      return this.lastStats;
    }

    // 2. If already fetching, wait a bit or return last stats to avoid overlap
    if (this.isFetching && this.lastStats) {
      return this.lastStats;
    }

    this.isFetching = true;
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercent = Math.round((usedMem / totalMem) * 100);
      const platform = process.platform;
      const uptime = Math.round(os.uptime());
      const cpuCores = os.cpus().length;
      
      let loadAvg = os.loadavg();

      const [cpu, disk, net] = await Promise.all([
        this.withTimeout(si.currentLoad(), 2000, { currentLoad: 0, avgLoad: 0 } as si.Systeminformation.CurrentLoadData),
        this.withTimeout(si.fsSize(), 2000, [] as si.Systeminformation.FsSizeData[]),
        this.withTimeout(si.networkStats(), 2000, [] as si.Systeminformation.NetworkStatsData[])
      ]);

      if (platform === 'win32' && loadAvg.every(v => v === 0)) {
        const current = (cpu.currentLoad || 0) / 100 * cpuCores;
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

      this.lastStats = {
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
      
      this.lastFetchTime = Date.now();
      return this.lastStats;
    } catch (e) {
      if (this.lastStats) return this.lastStats;
      
      // Attempt to return at least synchronous native stats on total failure
      try {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        return {
          cpuLoad: 0,
          cpuCores: os.cpus().length,
          memTotal: Math.round(totalMem / (1024 ** 3) * 100) / 100,
          memUsed: Math.round((totalMem - freeMem) / (1024 ** 3) * 100) / 100,
          memPercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
          diskTotal: 0,
          diskUsed: 0,
          diskPercent: 0,
          loadAvg: os.loadavg(),
          netSent: 0,
          netRecv: 0,
          uptime: Math.round(os.uptime()),
          platform: process.platform
        };
      } catch {
        return {
          cpuLoad: 0, cpuCores: 0, memTotal: 0, memUsed: 0, memPercent: 0,
          diskTotal: 0, diskUsed: 0, diskPercent: 0, loadAvg: [0, 0, 0],
          netSent: 0, netRecv: 0, uptime: 0, platform: process.platform
        };
      }
    } finally {
      this.isFetching = false;
    }
  }

  async checkPort(port: number): Promise<boolean> {
    try {
      const network = await si.networkConnections();
      return network.some(conn => conn.state === 'LISTEN' && parseInt(conn.localPort) === port);
    } catch {
      return false;
    }
  }
}
