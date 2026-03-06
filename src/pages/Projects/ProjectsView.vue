<template>
  <q-page class="q-pa-md">
    <!-- Compact Header -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-wcag-bold q-mr-lg">{{ $t('projects.title') }}</div>
      
      <div class="row q-gutter-x-sm items-center">
        <q-input
          v-model.number="radarPort"
          :placeholder="$t('projects.portRadar')"
          dense
          outlined
          type="number"
          style="width: 120px"
          @keyup.enter="checkRadar"
          class="shadow-1"
        >
          <template v-slot:append>
            <q-btn flat round dense icon="radar" :color="radarStatus === 'busy' ? 'negative' : (radarStatus === 'free' ? 'positive' : 'primary')" @click="checkRadar" size="sm" />
          </template>
        </q-input>

        <q-input
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          dense
          outlined
          class="shadow-1"
          style="width: 200px"
          clearable
          @clear="searchQuery = ''"
        >
          <template v-slot:prepend>
            <q-icon name="search" size="sm" />
          </template>
        </q-input>
        
        <q-btn outline color="primary" icon="refresh" :loading="projectsStore.loading" @click="projectsStore.syncAll" size="sm" class="text-weight-bold" />
        <q-btn color="primary" icon="history" @click="scanAllRoots" :disable="!settingsStore.settings.scanRoots?.length" size="sm" class="text-weight-bold shadow-1" unelevated />
        <q-btn color="accent" icon="add" :label="$t('projects.manualScan')" @click="showScanDialog = true" size="sm" class="text-weight-bold shadow-1" unelevated />
      </div>
    </div>

    <!-- Batch Actions Mini-Bar -->
    <q-slide-transition>
      <div v-if="selectedIds.length > 0" class="q-mb-md q-pa-sm rounded-borders bg-gradient-primary text-white row items-center shadow-2">
        <div class="text-weight-bolder q-mx-md">{{ selectedIds.length }} Selected</div>
        <q-space />
        <q-btn flat dense icon="delete" :label="$t('common.delete')" class="text-weight-bold" @click="confirmDeleteMultiple" />
        <q-btn flat round dense icon="close" @click="selectedIds = []" class="q-ml-sm" />
      </div>
    </q-slide-transition>

    <!-- High Density Projects Table -->
    <q-table
      :rows="filteredProjects"
      :columns="columns"
      row-key="id"
      dense
      flat
      bordered
      :pagination="{ rowsPerPage: 0 }"
      hide-pagination
      selection="multiple"
      v-model:selected="selectedRows"
      class="compact-table rounded-borders shadow-1"
      binary-state-sort
    >
      <!-- Name Column -->
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-icon name="folder" color="primary" class="q-mr-sm" size="18px" />
            <div class="text-weight-bolder text-wcag">{{ props.row.name }}</div>
            <q-icon v-if="props.row.git?.isDirty" name="mdi-pencil-box-multiple" color="warning" class="q-ml-xs" size="16px" />
          </div>
        </q-td>
      </template>

      <!-- Git Column -->
      <template v-slot:body-cell-git="props">
        <q-td :props="props">
          <div v-if="props.row.git" class="row items-center no-wrap q-gutter-x-xs">
            <q-badge color="primary" class="text-weight-bold" size="sm">
              <q-icon name="mdi-source-branch" size="12px" class="q-mr-xs" />
              {{ props.row.git.branch }}
            </q-badge>
            <div v-if="props.row.git.ahead > 0" class="text-positive text-weight-bold" style="font-size: 0.7rem">
              ↑{{ props.row.git.ahead }}
            </div>
            <div v-if="props.row.git.behind > 0" class="text-negative text-weight-bold" style="font-size: 0.7rem">
              ↓{{ props.row.git.behind }}
            </div>
          </div>
          <div v-else class="text-grey-5">-</div>
        </q-td>
      </template>

      <!-- Ports Column -->
      <template v-slot:body-cell-ports="props">
        <q-td :props="props">
          <div class="row q-gutter-xs items-center">
            <q-badge v-for="port in props.row.ports" :key="port" color="positive" class="text-weight-bold" style="font-size: 0.65rem">
              {{ port }}
            </q-badge>
            <q-badge v-for="port in getMissingManagedPorts(props.row)" :key="'m'+port" outline color="primary" class="text-weight-bold" style="font-size: 0.65rem">
              {{ port }}
            </q-badge>
            <q-btn flat round dense icon="add" size="6px" color="primary" @click="promptAddPort(props.row.id)" />
          </div>
        </q-td>
      </template>

      <!-- Tech Column -->
      <template v-slot:body-cell-tech="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-icon v-for="tech in props.row.techs" :key="tech" :name="getTechIcon(tech)" size="18px" :color="techColorMap[tech] || 'grey-7'">
              <q-tooltip>{{ tech }}</q-tooltip>
            </q-icon>
          </div>
        </q-td>
      </template>

      <!-- Actions Column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <div class="row items-center justify-end q-gutter-x-xs">
            <q-btn flat round dense icon="mdi-microsoft-visual-studio-code" size="sm" color="primary" @click="projectsStore.openVsCode(props.row.path)">
              <q-tooltip>VS Code</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="terminal" size="sm" color="secondary" @click="projectsStore.openTerminal(props.row.path)">
              <q-tooltip>Terminal</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="more_vert" size="sm" color="grey-7">
              <q-menu dense>
                <q-list style="min-width: 150px">
                  <q-item clickable v-close-popup @click="projectsStore.openFolder(props.row.path)">
                    <q-item-section side><q-icon name="folder_open" size="xs" /></q-item-section>
                    <q-item-section>Explorer</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="confirmDelete(props.row)" class="text-negative">
                    <q-item-section side><q-icon name="delete" size="xs" color="negative" /></q-item-section>
                    <q-item-section>Remove</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Scan Dialog (Same logic, more compact) -->
    <q-dialog v-model="showScanDialog" backdrop-filter="blur(4px)">
      <q-card style="min-width: 400px" class="rounded-borders">
        <q-card-section class="bg-gradient-primary text-white q-py-sm">
          <div class="text-subtitle1 text-weight-bolder">{{ $t('projects.scanTitle') }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm q-pt-md">
          <q-input v-model="scanPath" :label="$t('projects.rootPathLabel')" dense filled @keyup.enter="startScan" autofocus />
        </q-card-section>
        <q-card-actions align="right" class="q-pb-md q-px-md">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup size="sm" />
          <q-btn color="primary" :label="$t('projects.startScan')" unelevated @click="startScan" v-close-popup size="sm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center q-py-sm">
          <q-icon name="warning" color="negative" size="md" class="q-mr-sm" />
          <div class="text-weight-bold text-wcag">Remove {{ projectToDelete?.name }}?</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup size="sm" />
          <q-btn flat label="Remove" color="negative" @click="deleteProject" v-close-popup size="sm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useProjectsStore } from '../../stores/projectsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useSystemStore } from '../../stores/systemStore';
import { api } from '../../boot/axios';
import type { Project } from '../../stores/projectsStore';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import FaviconRenderer from '../../components/FaviconRenderer.vue';

const $q = useQuasar();
const { t } = useI18n();
const projectsStore = useProjectsStore();
const settingsStore = useSettingsStore();
const systemStore = useSystemStore();

const showScanDialog = ref(false);
const showDeleteDialog = ref(false);
const projectToDelete = ref<Project | null>(null);
const scanPath = ref('');
const searchQuery = ref('');
const selectedRows = ref<Project[]>([]);

const selectedIds = computed(() => selectedRows.value.map(r => r.id));

// Port Radar
const radarPort = ref<number | null>(null);
const radarStatus = ref<'idle' | 'free' | 'busy'>('idle');

const columns: any[] = [
  { name: 'name', label: 'PROJECT', field: 'name', align: 'left', sortable: true },
  { name: 'git', label: 'GIT', align: 'left' },
  { name: 'ports', label: 'PORTS', align: 'left' },
  { name: 'tech', label: 'STACK', align: 'left' },
  { name: 'actions', label: '', align: 'right' }
];

const techColorMap: Record<string, string> = {
  vue: 'positive',
  react: 'info',
  nodejs: 'positive',
  typescript: 'primary',
  python: 'warning',
  docker: 'primary',
  rust: 'orange-9',
  php: 'indigo-9',
  go: 'light-blue-7'
};

const searchPlaceholder = computed(() => t('projects.noProjectsMatching', { query: '' }).replace(' ""', '...'));

const filteredProjects = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim();
  if (!query) return projectsStore.projects;
  return projectsStore.projects.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.path.toLowerCase().includes(query) ||
    p.techs.some(t => t.toLowerCase().includes(query))
  );
});

const getMissingManagedPorts = (project: Project) => (project.managedPorts || []).filter(p => !project.ports.includes(p));

const getTechIcon = (tech: string) => {
  const t = tech.toLowerCase();
  const icons: Record<string, string> = {
    nodejs: 'mdi-nodejs',
    vue: 'mdi-vuejs',
    react: 'mdi-react',
    quasar: 'mdi-lightning-bolt',
    typescript: 'mdi-language-typescript',
    python: 'mdi-language-python',
    docker: 'mdi-docker',
    rust: 'mdi-language-rust',
    go: 'mdi-language-go',
    php: 'mdi-language-php'
  };
  return icons[t] || 'mdi-code-braces';
};

const getShortPath = (path: string) => {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1] || path;
};

const checkRadar = async () => {
  if (!radarPort.value) return;
  try {
    await api.post('/api/projects/sync-all');
    await projectsStore.loadProjects();
    const isUsed = projectsStore.projects.some(p => p.ports.includes(radarPort.value!));
    radarStatus.value = isUsed ? 'busy' : 'free';
    $q.notify({
      message: `Port ${radarPort.value} is ${isUsed ? 'BUSY' : 'FREE'}`,
      color: isUsed ? 'negative' : 'positive',
      position: 'top',
      timeout: 1500
    });
  } catch (e) {}
};

const startScan = async () => {
  if (scanPath.value) {
    await projectsStore.scanDirectory(scanPath.value);
    $q.notify({ message: 'Scan completed', color: 'positive', icon: 'check', position: 'bottom-right' });
  }
};

const scanAllRoots = async () => {
  $q.loading.show();
  try {
    for (const root of settingsStore.settings.scanRoots) await projectsStore.scanDirectory(root);
  } finally { $q.loading.hide(); }
};

const scanSpecificRoot = (root: string) => {
  scanPath.value = root;
  void startScan();
};

const confirmDeleteMultiple = () => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Remove ${selectedRows.value.length} projects?`,
    cancel: true,
    dark: true
  }).onOk(() => {
    void (async () => {
      for (const p of selectedRows.value) await projectsStore.deleteProject(p.id);
      selectedRows.value = [];
    })();
  });
};

const confirmDelete = (project: Project) => {
  projectToDelete.value = project;
  showDeleteDialog.value = true;
};

const deleteProject = async () => {
  if (projectToDelete.value) {
    await api.post('/api/projects/remove', { id: projectToDelete.value.id });
    await projectsStore.loadProjects();
    projectToDelete.value = null;
  }
};

const promptAddPort = (projectId: string) => {
  $q.dialog({
    title: 'Pin Port',
    message: 'Port number:',
    prompt: { model: '', type: 'number' },
    cancel: true,
    dark: true
  }).onOk((data: string) => {
    const port = parseInt(data);
    if (!isNaN(port)) void projectsStore.addManagedPort(projectId, port);
  });
};

onMounted(() => {
  void projectsStore.loadProjects();
  void settingsStore.loadSettings();
});
</script>

<style lang="sass" scoped>
.compact-table
  background: var(--dd-card-bg)
  border: 1px solid var(--dd-border)
  
  :deep(th)
    font-weight: 800
    color: var(--dd-text-secondary)
    background: rgba(0,0,0,0.02)
    font-size: 0.7rem
    letter-spacing: 1px
    
  :deep(td)
    font-size: 0.85rem
    border-bottom: 1px solid var(--dd-border)

.body--dark .compact-table
  :deep(th)
    background: rgba(255,255,255,0.03)

.batch-actions-bar
  overflow: hidden
  position: relative

.glossy-overlay
  position: absolute
  top: 0
  left: 0
  right: 0
  height: 100%
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)
  pointer-events: none

.tracking-tight
  letter-spacing: -1.5px
</style>
