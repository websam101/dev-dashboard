import { defineStore } from 'pinia'
import { IndexedDbAdapter } from '../services/db/adapter/IndexedDbAdapter'
import type { PortRecord } from '../services/db/adapter/IndexedDbAdapter'

export const usePortsStore = defineStore('ports', {
  state: () => ({
    ports: [] as PortRecord[],
    db: new IndexedDbAdapter()
  }),
  actions: {
    async loadPorts() {
      this.ports = await this.db.getPorts()
    },
    async addPort(port: PortRecord) {
      await this.db.addPort(port)
      this.ports = await this.db.getPorts()
    },
    async updatePort(port: PortRecord) {
      await this.db.updatePort(port)
      this.ports = await this.db.getPorts()
    },
    async deletePort(port: number) {
      await this.db.deletePort(port)
      this.ports = await this.db.getPorts()
    },
    checkPortUsage(port: number): { inUse: boolean; pid?: number; process?: string } {
      const result = { inUse: false }
      try {
        const { execSync } = require('child_process')
        try {
          const output = execSync(`ss -tuln | grep :${port} || lsof -i :${port} 2>/dev/null || netstat -tuln | grep :${port} 2>/dev/null`)
          result.inUse = output.length > 0
        } catch {
          result.inUse = false
        }
      } catch {
        result.inUse = false
      }
      return result
    }
  }
})
