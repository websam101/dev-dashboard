<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Port Manager</div>
        <q-btn
          icon="refresh"
          flat
          round
          @click="refreshPorts"
        />
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="ports"
          :columns="columns"
          row-key="port"
          flat
          bordered
        >
          <template v-slot:body-cell-reserved="props">
            <q-td :props="props">
              <q-checkbox v-model="props.row.reserved" @update:model-value="updatePort(props.row)" />
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="props.row.inUse ? 'negative' : 'positive'">
                {{ props.row.inUse ? 'In Use' : 'Free' }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-pid="props">
            <q-td :props="props">
              {{ props.row.pid || '-' }}
            </q-td>
          </template>
          <template v-slot:body-cell-processName="props">
            <q-td :props="props">
              {{ props.row.processName || '-' }}
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                size="sm"
                flat
                round
                icon="search"
                @click="checkPort(props.row.port)"
              >
                <q-tooltip>Check</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                flat
                round
                icon="delete"
                color="negative"
                @click="deletePort(props.row.port)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePortsStore } from '../../stores/portsStore'
import type { PortRecord } from '../../services/db/adapter/IndexedDbAdapter'
import type { QTableColumn } from 'quasar'

const portsStore = usePortsStore()
const ports = ref<PortRecord[]>([])

const columns: QTableColumn[] = [
  { name: 'port', label: 'Port', field: 'port', align: 'left', sortable: true },
  { name: 'reserved', label: 'Reserved', field: 'reserved', align: 'center' },
  { name: 'status', label: 'Status', field: 'inUse', align: 'center', sortable: true },
  { name: 'pid', label: 'PID', field: 'pid', align: 'left' },
  { name: 'processName', label: 'Process', field: 'processName', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const loadPorts = async () => {
  await portsStore.loadPorts()
  ports.value = portsStore.ports
}

const checkPort = async (port: number) => {
  try {
    const { execSync } = require('child_process')
    const output = execSync(`ss -tuln | grep :${port} || netstat -tuln | grep :${port} 2>/dev/null || echo ''`)
    const inUse = output.length > 0
    const portRecord = ports.value.find(p => p.port === port)
    if (portRecord) {
      portRecord.inUse = inUse
      await portsStore.updatePort(portRecord)
    } else {
      await portsStore.addPort({ port, projectId: '', reserved: false, inUse, pid: undefined, processName: undefined })
    }
    await loadPorts()
  } catch (e) {
    console.error('Failed to check port', e)
  }
}

const updatePort = async (port: PortRecord) => {
  await portsStore.updatePort(port)
}

const deletePort = async (port: number) => {
  await portsStore.deletePort(port)
  await loadPorts()
}

const refreshPorts = async () => {
  for (const port of ports.value) {
    try {
      const { execSync } = require('child_process')
      const output = execSync(`ss -tuln | grep :${port.port} || netstat -tuln | grep :${port.port} 2>/dev/null || echo ''`)
      port.inUse = output.length > 0
      await portsStore.updatePort(port)
    } catch (e) {
      console.error('Failed to check port', e)
    }
  }
  await loadPorts()
}

onMounted(async () => {
  await loadPorts()
})
</script>
