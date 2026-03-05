<template>
  <q-page class="q-pa-md">
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">Add Repository</div>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="addRepo" class="q-gutter-md">
          <q-input
            v-model="newRepo.url"
            label="Repository URL"
            placeholder="https://github.com/user/repo"
            filled
            required
          />
          <q-input
            v-model="newRepo.localPath"
            label="Local Path"
            placeholder="/home/user/code/repo"
            filled
            required
          />
          <q-btn
            type="submit"
            color="primary"
            label="Add Repository"
          />
        </q-form>
      </q-card-section>
    </q-card>

    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Repositories</div>
        <q-btn
          icon="refresh"
          flat
          round
          @click="refreshRepos"
        />
      </q-card-section>
      <q-card-section>
        <q-table
          :rows="repos"
          :columns="columns"
          row-key="url"
          flat
          bordered
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                size="sm"
                flat
                round
                icon="cloud_download"
                @click="cloneRepo(props.row.url, props.row.localPath)"
              >
                <q-tooltip>Clone</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                flat
                round
                icon="download"
                @click="pullRepo(props.row.localPath)"
              >
                <q-tooltip>Pull</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                flat
                round
                icon="upload"
                @click="pushRepo(props.row.localPath)"
              >
                <q-tooltip>Push</q-tooltip>
              </q-btn>
              <q-btn
                size="sm"
                flat
                round
                icon="delete"
                color="negative"
                @click="deleteRepo(props.row.url)"
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
import { useGitStore } from '../../stores/gitStore'
import type { GitRepo } from '../../services/db/adapter/IndexedDbAdapter'
import type { QTableColumn } from 'quasar'

const gitStore = useGitStore()
const repos = ref<GitRepo[]>([])
const newRepo = ref<GitRepo>({
  url: '',
  localPath: '',
  branch: 'main',
  status: 'clean',
  lastSync: new Date().toISOString()
})

const columns: QTableColumn[] = [
  { name: 'url', label: 'Repository URL', field: 'url', align: 'left', sortable: true },
  { name: 'localPath', label: 'Local Path', field: 'localPath', align: 'left', sortable: true },
  { name: 'branch', label: 'Branch', field: 'branch', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'lastSync', label: 'Last Sync', field: 'lastSync', align: 'left', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

const loadRepos = async () => {
  await gitStore.loadRepos()
  repos.value = gitStore.repos
}

const addRepo = async () => {
  if (!newRepo.value.url || !newRepo.value.localPath) {
    alert('URL and Local Path are required')
    return
  }
  await gitStore.addRepo({
    ...newRepo.value,
    lastSync: new Date().toISOString()
  })
  repos.value = gitStore.repos
  newRepo.value = { url: '', localPath: '', branch: 'main', status: 'clean', lastSync: new Date().toISOString() }
}

const deleteRepo = async (url: string) => {
  await gitStore.deleteRepo(url)
  repos.value = gitStore.repos
}

const refreshRepos = async () => {
  for (const repo of repos.value) {
    try {
      const { execSync } = require('child_process')
      const statusResult = execSync(`cd "${repo.localPath}" && git status --porcelain 2>/dev/null | head -n 1 || echo ''`)
      repo.status = statusResult.toString().length > 0 ? 'dirty' : 'clean'
      repo.branch = execSync(`cd "${repo.localPath}" && git branch --show-current 2>/dev/null || echo 'main'`).toString().trim()
      repo.lastSync = new Date().toISOString()
      await gitStore.updateRepo(repo)
    } catch (e) {
      console.error('Failed to check git status', e)
    }
  }
  await loadRepos()
}

const cloneRepo = (url: string, dest: string) => {
  try {
    const { exec } = require('child_process')
    exec(`git clone "${url}" "${dest}"`, (error: Error | null, _stdout: string, stderr: string) => {
      if (error) {
        alert(`Clone failed: ${stderr}`)
      } else {
        alert('Clone successful')
      }
    })
  } catch {
    alert('Git not installed')
  }
}

const pullRepo = (path: string) => {
  try {
    const { exec } = require('child_process')
    exec(`cd "${path}" && git pull`, (error: Error | null, _stdout: string, stderr: string) => {
      if (error) {
        alert(`Pull failed: ${stderr}`)
      } else {
        alert('Pull successful')
      }
    })
  } catch {
    alert('Git not installed')
  }
}

const pushRepo = (path: string) => {
  try {
    const { exec } = require('child_process')
    exec(`cd "${path}" && git push`, (error: Error | null, _stdout: string, stderr: string) => {
      if (error) {
        alert(`Push failed: ${stderr}`)
      } else {
        alert('Push successful')
      }
    })
  } catch {
    alert('Git not installed')
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'clean': return 'green'
    case 'dirty': return 'orange'
    default: return 'white'
  }
}

onMounted(async () => {
  await loadRepos()
})
</script>
