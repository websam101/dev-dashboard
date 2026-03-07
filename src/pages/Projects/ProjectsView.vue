<template>
  <q-page class="q-pa-md">
    <!-- Compact Header -->
    <div class="row items-center q-mb-md">
      <h1 class="text-h5 text-wcag-bold q-mr-lg q-ma-none">{{ $t('projects.title') }}</h1>
      
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
            <q-btn flat round dense icon="mdi-radar" :color="radarStatus === 'busy' ? 'negative' : (radarStatus === 'free' ? 'positive' : 'primary')" @click="checkRadar" size="sm" :aria-label="$t('projects.portRadarHint')">
              <q-tooltip>{{ $t('projects.portRadarHint') }}</q-tooltip>
            </q-btn>
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
            <q-icon name="mdi-magnify" size="sm" />
          </template>
        </q-input>
        
        <q-btn outline color="primary" icon="mdi-refresh" :loading="projectsStore.loading" @click="projectsStore.syncAll" size="sm" class="text-weight-bold" :aria-label="$t('common.refresh')">
          <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
        </q-btn>
        <q-btn color="primary" icon="mdi-history" @click="scanAllRoots" :disable="!settingsStore.settings.scanRoots?.length" size="sm" class="text-weight-bold shadow-1" unelevated :aria-label="$t('projects.scanAllRoots')">
          <q-tooltip>{{ $t('projects.scanAllRoots') }}</q-tooltip>
        </q-btn>
        <q-btn color="accent" icon="mdi-plus" :label="$t('projects.manualScan')" @click="showScanDialog = true" size="sm" class="text-weight-bold shadow-1" unelevated>
          <q-tooltip>{{ $t('projects.manualScanHint') }}</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Restored Managed Roots chips -->
    <div v-if="settingsStore.settings.scanRoots?.length" class="q-mb-md row items-center q-gutter-sm">
      <div class="text-overline text-wcag-bold opacity-70 q-mr-sm" style="font-size: 0.6rem">QUICK SCAN</div>
      <q-chip 
        v-for="(root, index) in settingsStore.settings.scanRoots" 
        :key="root" 
        clickable 
        outline 
        color="primary"
        icon="mdi-folder"
        @click="scanSpecificRoot(root)"
        :class="'tag-bg-' + ((index % 6) + 1)"
        class="text-weight-bolder shadow-1 hover-scale q-ma-none"
        dense
        size="sm"
      >
        <span class="text-weight-bolder">{{ getShortPath(root) }}</span>
        <q-tooltip>{{ root }}</q-tooltip>
      </q-chip>
    </div>

    <!-- Batch Actions Mini-Bar -->
    <q-slide-transition>
      <div v-if="selectedIds.length > 0" class="q-mb-md q-pa-sm rounded-borders bg-gradient-primary text-white row items-center shadow-2">
        <div class="text-weight-bolder q-mx-md">{{ selectedIds.length }} Selected</div>
        <q-space />
        <q-btn flat dense icon="mdi-delete" :label="$t('common.delete')" class="text-weight-bold" @click="confirmDeleteMultiple">
          <q-tooltip>{{ $t('projects.deleteSelectedHint') }}</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="mdi-close" @click="selectedIds = []" class="q-ml-sm" :aria-label="$t('common.cancel')">
          <q-tooltip>{{ $t('common.cancel') }}</q-tooltip>
        </q-btn>
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
      :pagination="pagination"
      hide-pagination
      selection="multiple"
      v-model:selected="selectedRows"
      class="compact-table rounded-borders shadow-1"
      binary-state-sort
    >
      <!-- Header Selection Override -->
      <template v-slot:header-selection="scope">
        <q-checkbox v-model="scope.selected" dense :aria-label="$t('common.selectAll')" />
      </template>

      <!-- Body Selection Override -->
      <template v-slot:body-selection="scope">
        <q-checkbox v-model="scope.selected" dense :aria-label="$t('common.selectItem')" />
      </template>

      <!-- Name Column -->
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-icon name="mdi-folder" color="primary" class="q-mr-sm" size="18px" />
            <div class="text-weight-bolder text-wcag">{{ props.row.name }}</div>
            <q-icon v-if="props.row.git?.isDirty" name="mdi-pencil-box-multiple" color="warning" class="q-ml-xs" size="16px">
              <q-tooltip>{{ $t('projects.gitDirty') }}</q-tooltip>
            </q-icon>
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
              <q-tooltip>{{ $t('projects.activeBranch') }}: {{ props.row.git.branch }}</q-tooltip>
            </q-badge>
            <div v-if="props.row.git.ahead > 0" class="text-positive text-weight-bold" style="font-size: 0.7rem">
              ↑{{ props.row.git.ahead }}
              <q-tooltip>{{ props.row.git.ahead }} {{ $t('projects.commitsAhead') }}</q-tooltip>
            </div>
            <div v-if="props.row.git.behind > 0" class="text-negative text-weight-bold" style="font-size: 0.7rem">
              ↓{{ props.row.git.behind }}
              <q-tooltip>{{ props.row.git.behind }} {{ $t('projects.commitsBehind') }}</q-tooltip>
            </div>
          </div>
          <div v-else class="text-wcag-caption">-</div>
        </q-td>
      </template>

      <!-- Ports Column -->
      <template v-slot:body-cell-ports="props">
        <q-td :props="props">
          <div class="row q-gutter-xs items-center">
            <q-badge 
              v-for="port in props.row.ports" 
              :key="port" 
              :color="duplicatePorts.has(port) ? 'negative' : 'positive'" 
              class="text-weight-bold" 
              style="font-size: 0.65rem"
            >
              {{ port }}
              <q-tooltip>{{ duplicatePorts.has(port) ? $t('projects.portConflict') : $t('projects.portActive') }}</q-tooltip>
            </q-badge>
            <q-badge 
              v-for="port in getMissingManagedPorts(props.row)" 
              :key="'m'+port" 
              outline 
              :color="duplicatePorts.has(port) ? 'negative' : 'primary'" 
              class="text-weight-bold cursor-pointer" 
              style="font-size: 0.65rem"
              @click="manageProjectPorts(props.row)"
            >
              {{ port }}
              <q-tooltip>{{ duplicatePorts.has(port) ? $t('projects.portConflict') : $t('projects.portPinnedOffline') }}</q-tooltip>
            </q-badge>
            <q-btn flat round dense icon="mdi-cog" size="6px" color="primary" @click="manageProjectPorts(props.row)" :aria-label="$t('projects.managePorts')">
              <q-tooltip>{{ $t('projects.managePorts') }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>

      <!-- Tech Column -->
      <template v-slot:body-cell-tech="props">
        <q-td :props="props">
          <div class="row q-gutter-xs">
            <q-icon v-for="tech in props.row.techs" :key="tech" :name="getTechIcon(tech)" size="18px" :color="techColorMap[tech.toLowerCase()] || 'grey-7'">
              <q-tooltip>{{ tech }}</q-tooltip>
            </q-icon>
          </div>
        </q-td>
      </template>

      <!-- Actions Column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <div class="row items-center justify-end q-gutter-x-xs">
            <q-btn flat round dense icon="mdi-microsoft-visual-studio-code" size="sm" color="primary" @click="projectsStore.openVsCode(props.row.path)" :aria-label="$t('projects.openVsCode')">
              <q-tooltip>{{ $t('projects.openVsCode') }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="mdi-console" size="sm" color="secondary" @click="projectsStore.openTerminal(props.row.path)" :aria-label="$t('projects.openTerminal')">
              <q-tooltip>{{ $t('projects.openTerminal') }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="mdi-dots-vertical" size="sm" color="grey-7" :aria-label="$t('common.moreActions')">
              <q-tooltip>{{ $t('common.moreActions') }}</q-tooltip>
              <q-menu dense>
                <q-list style="min-width: 180px">
                  <q-item v-if="props.row.git" clickable v-close-popup @click="handleGitPull(props.row)">
                    <q-item-section side><q-icon name="mdi-download" size="xs" color="positive" /></q-item-section>
                    <q-item-section>{{ $t('projects.gitPull') }}</q-item-section>
                  </q-item>
                  <q-item v-if="props.row.git" clickable v-close-popup @click="handleGitPush(props.row)">
                    <q-item-section side><q-icon name="mdi-upload" size="xs" color="primary" /></q-item-section>
                    <q-item-section>{{ $t('projects.gitPush') }}</q-item-section>
                  </q-item>
                  <q-separator v-if="props.row.git" />
                  <q-item clickable v-close-popup @click="projectsStore.openFolder(props.row.path)">
                    <q-item-section side><q-icon name="mdi-folder-open" size="xs" /></q-item-section>
                    <q-item-section>{{ $t('projects.openExplorer') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup @click="confirmDelete(props.row)" class="text-negative">
                    <q-item-section side><q-icon name="mdi-delete" size="xs" color="negative" /></q-item-section>
                    <q-item-section>{{ $t('common.remove') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Manage Ports Dialog -->
    <q-dialog v-model="showPortsDialog" backdrop-filter="blur(4px)">
      <q-card style="min-width: 450px" class="rounded-xl">
        <q-card-section class="bg-gradient-primary text-white q-py-md">
          <div class="text-h6 text-weight-bolder">{{ projectManagingPorts?.name }} - {{ $t('projects.managePorts') }}</div>
        </q-card-section>
        
        <q-card-section class="q-pa-md">
          <div class="row q-gutter-sm q-mb-lg">
            <q-input v-model.number="newPinnedPort" :label="$t('projects.pinNewPort')" dense outlined type="number" class="col" @keyup.enter="addPinnedPort" />
            <q-btn color="primary" icon="mdi-plus" @click="addPinnedPort" :disable="!newPinnedPort" :aria-label="$t('projects.addPort')">
              <q-tooltip>{{ $t('projects.addPort') }}</q-tooltip>
            </q-btn>
          </div>

          <q-list bordered separator class="rounded-borders overflow-hidden">
            <q-item v-for="port in projectManagingPorts?.managedPorts" :key="port" dense class="q-py-sm">
              <q-item-section v-if="editingPortValue === port">
                <q-input 
                  v-model.number="tempPortEdit" 
                  dense 
                  outlined 
                  type="number" 
                  autofocus 
                  @keyup.enter="savePortEdit(port)" 
                  @keyup.esc="editingPortValue = null"
                />
              </q-item-section>
              <q-item-section v-else>
                <q-item-label class="text-h6 text-weight-bold" :class="duplicatePorts.has(port) ? 'text-negative' : 'text-wcag'">
                  {{ port }}
                  <q-icon v-if="duplicatePorts.has(port)" name="mdi-alert-circle" size="xs" class="q-ml-xs">
                    <q-tooltip>{{ $t('projects.portConflict') }}</q-tooltip>
                  </q-icon>
                </q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <div class="row q-gutter-x-xs">
                  <template v-if="editingPortValue === port">
                    <q-btn flat round dense icon="mdi-check" color="positive" size="sm" @click="savePortEdit(port)" :aria-label="$t('common.save')">
                      <q-tooltip>{{ $t('common.save') }}</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="mdi-close" color="grey" size="sm" @click="editingPortValue = null" :aria-label="$t('common.cancel')">
                      <q-tooltip>{{ $t('common.cancel') }}</q-tooltip>
                    </q-btn>
                  </template>
                  <template v-else>
                    <q-btn flat round dense icon="mdi-pencil" color="primary" size="sm" @click="startPortEdit(port)" :aria-label="$t('common.edit')">
                      <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="mdi-delete" color="negative" size="sm" @click="removePinnedPort(port)" :aria-label="$t('common.remove')">
                      <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
                    </q-btn>
                  </template>
                </div>
              </q-item-section>
            </q-item>
            <q-item v-if="!projectManagingPorts?.managedPorts?.length" class="text-center q-pa-md text-wcag-caption italic">
              {{ $t('projects.noPinnedPorts') }}
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md border-top">
          <q-btn flat :label="$t('common.close')" color="primary" v-close-popup class="text-weight-bold" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Scan Dialog -->
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
          <q-btn color="primary" :label="$t('projects.startScan')" unelevated @click="startScan" v-close-popup size="sm">
            <q-tooltip>{{ $t('projects.startScanHint') }}</q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation -->
    <q-dialog v-model="showDeleteDialog">
      <q-card style="min-width: 300px">
        <q-card-section class="row items-center q-py-sm">
          <q-icon name="mdi-alert" color="negative" size="md" class="q-mr-sm" />
          <div class="text-weight-bold text-wcag">{{ $t('projects.confirmRemove', { name: projectToDelete?.name }) }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup size="sm" />
          <q-btn flat :label="$t('common.remove')" color="negative" @click="deleteProject" v-close-popup size="sm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProjectsStore } from '../../stores/projectsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useSystemStore } from '../../stores/systemStore';
import { api } from '../../boot/api';
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
const showPortsDialog = ref(false);
const projectToDelete = ref<Project | null>(null);
const projectManagingPorts = ref<Project | null>(null);
const scanPath = ref('');
const searchQuery = ref('');
const selectedRows = ref<Project[]>([]);
const newPinnedPort = ref<number | null>(null);
const editingPortValue = ref<number | null>(null);
const tempPortEdit = ref<number | null>(null);
const gitLoading = ref<Record<string, boolean>>({});

const selectedIds = computed(() => selectedRows.value.map(r => r.id));

const pagination = ref({
  sortBy: 'path',
  descending: false,
  rowsPerPage: 0
});

const radarPort = ref<number | null>(null);
const radarStatus = ref<'idle' | 'free' | 'busy'>('idle');

const columns: any[] = [
  { name: 'name', label: t('projects.colName'), field: 'name', align: 'left', sortable: true },
  { name: 'path', label: t('projects.colPath'), field: 'path', align: 'left', sortable: true },
  { name: 'git', label: t('projects.colGit'), align: 'left' },
  { name: 'ports', label: t('projects.colPorts'), align: 'left' },
  { name: 'tech', label: t('projects.colStack'), align: 'left' },
  { name: 'actions', label: t('common.actions'), align: 'right' }
];

const techColorMap: Record<string, string> = {
  vue: 'positive', vuejs: 'positive', react: 'info', reactjs: 'info',
  nodejs: 'positive', node: 'positive', typescript: 'primary', ts: 'primary',
  python: 'warning', docker: 'primary', rust: 'orange-9', php: 'indigo-9', go: 'light-blue-7'
};

const searchPlaceholder = computed(() => t('projects.noProjectsMatching', { query: '' }).replace(' ""', '...'));

const filteredProjects = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim();
  if (!query) return projectsStore.projects;
  return projectsStore.projects.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.path.toLowerCase().includes(query) ||
    p.techs.some(tech => tech.toLowerCase().includes(query))
  );
});

const duplicatePorts = computed(() => {
  const allPorts = new Map<number, string[]>();
  const duplicates = new Set<number>();
  projectsStore.projects.forEach(p => {
    const ports = new Set([...p.ports, ...(p.managedPorts || [])]);
    ports.forEach(port => {
      if (allPorts.has(port)) duplicates.add(port);
      else allPorts.set(port, [p.name]);
    });
  });
  return duplicates;
});

const getMissingManagedPorts = (project: Project) => (project.managedPorts || []).filter(p => !project.ports.includes(p));

const getTechIcon = (tech: string) => {
  const lowTech = tech.toLowerCase();
  const icons: Record<string, string> = {
    nodejs: 'mdi-nodejs', node: 'mdi-nodejs', vue: 'mdi-vuejs', vuejs: 'mdi-vuejs',
    react: 'mdi-react', reactjs: 'mdi-react', quasar: 'mdi-lightning-bolt',
    typescript: 'mdi-language-typescript', ts: 'mdi-language-typescript',
    python: 'mdi-language-python', docker: 'mdi-docker', rust: 'mdi-language-rust',
    go: 'mdi-language-go', php: 'mdi-language-php'
  };
  return icons[lowTech] || 'mdi-code-braces';
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
    $q.notify({ message: t('projects.portStatus', { port: radarPort.value, status: isUsed ? 'BUSY' : 'FREE' }), color: isUsed ? 'negative' : 'positive', position: 'top', timeout: 1500 });
  } catch (e) {}
};

const startScan = async () => { if (scanPath.value) { await projectsStore.scanDirectory(scanPath.value); $q.notify({ message: t('projects.scanCompleted'), color: 'positive', icon: 'mdi-check', position: 'bottom-right' }); } };
const scanAllRoots = async () => { $q.loading.show(); try { for (const root of settingsStore.settings.scanRoots) await projectsStore.scanDirectory(root); } finally { $q.loading.hide(); } };
const scanSpecificRoot = (root: string) => { scanPath.value = root; void startScan(); };

const handleGitPull = async (project: Project) => {
  const key = project.id + 'pull';
  gitLoading.value[key] = true;
  try {
    await projectsStore.gitPull(project.path);
    systemStore.addNotification({ message: `Pulled ${project.name}`, icon: 'download', color: 'positive' });
    $q.notify({ message: `Pulled ${project.name}`, color: 'positive', icon: 'mdi-check' });
  } catch (e) {
    $q.notify({ message: `Error: ${String(e)}`, color: 'negative' });
  } finally {
    gitLoading.value[key] = false;
  }
};

const handleGitPush = async (project: Project) => {
  const key = project.id + 'push';
  gitLoading.value[key] = true;
  try {
    await projectsStore.gitPush(project.path);
    systemStore.addNotification({ message: `Pushed ${project.name}`, icon: 'upload', color: 'positive' });
    $q.notify({ message: `Pushed ${project.name}`, color: 'positive', icon: 'mdi-check' });
  } catch (e) {
    $q.notify({ message: `Error: ${String(e)}`, color: 'negative' });
  } finally {
    gitLoading.value[key] = false;
  }
};

const confirmDeleteMultiple = () => {
  $q.dialog({ title: t('common.confirmDelete'), message: t('projects.deleteSelectedConfirm', { count: selectedRows.value.length }), cancel: true, dark: true }).onOk(() => {
    void (async () => {
      for (const p of selectedRows.value) await projectsStore.deleteProject(p.id);
      selectedRows.value = [];
    })();
  });
};

const confirmDelete = (project: Project) => { projectToDelete.value = project; showDeleteDialog.value = true; };
const deleteProject = async () => { if (projectToDelete.value) { await api.post('/api/projects/remove', { id: projectToDelete.value.id }); await projectsStore.loadProjects(); projectToDelete.value = null; } };

// Managed Ports Dialog Actions
const manageProjectPorts = (project: Project) => {
  projectManagingPorts.value = project;
  showPortsDialog.value = true;
};

const addPinnedPort = async () => {
  if (projectManagingPorts.value && newPinnedPort.value) {
    await projectsStore.addManagedPort(projectManagingPorts.value.id, newPinnedPort.value);
    newPinnedPort.value = null;
  }
};

const removePinnedPort = async (port: number) => {
  if (projectManagingPorts.value) {
    await projectsStore.removeManagedPort(projectManagingPorts.value.id, port);
  }
};

const startPortEdit = (port: number) => {
  editingPortValue.value = port;
  tempPortEdit.value = port;
};

const savePortEdit = async (oldPort: number) => {
  if (projectManagingPorts.value && tempPortEdit.value && tempPortEdit.value !== oldPort) {
    await projectsStore.removeManagedPort(projectManagingPorts.value.id, oldPort);
    await projectsStore.addManagedPort(projectManagingPorts.value.id, tempPortEdit.value);
    editingPortValue.value = null;
  } else {
    editingPortValue.value = null;
  }
};

onMounted(() => {
  void projectsStore.loadProjects();
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
    font-size: 0.8rem
    border-bottom: 1px solid var(--dd-border)

.body--dark .compact-table
  :deep(th)
    background: rgba(255,255,255,0.03)

.hover-scale
  transition: transform 0.2s ease
  &:hover
    transform: scale(1.05)

.tracking-tight
  letter-spacing: -1.5px
</style>
