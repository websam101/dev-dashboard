<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="text-h5">Project Hub</div>
      <q-space />
      <div class="q-gutter-sm">
        <q-btn outline color="primary" icon="refresh" label="Sync All" :loading="projectsStore.loading" @click="projectsStore.syncAll" />
        <q-btn color="primary" icon="search" label="Scan Directory" @click="showScanDialog = true" />
      </div>
    </div>

    <div v-if="projectsStore.loading && projectsStore.projects.length === 0" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-grey-6">Syncing your lab...</div>
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="project in projectsStore.projects" :key="project.id" class="col-12">
        <q-card bordered flat class="project-row bg-grey-9">
          <q-card-section class="row items-center no-wrap">
            <!-- Project Identification -->
            <div class="col-grow">
              <div class="row items-center q-gutter-x-sm">
                <div class="text-h6 text-grey-3">{{ project.name }}</div>
                <q-badge v-if="project.git?.branch" color="grey-8" text-color="primary" class="q-px-sm">
                  <q-icon name="history" size="14px" class="q-mr-xs" />
                  {{ project.git.branch }}
                </q-badge>
                <q-icon v-if="project.git?.isDirty" name="edit_note" color="warning" size="20px">
                  <q-tooltip>Uncommitted Changes</q-tooltip>
                </q-icon>
              </div>
              <div class="text-caption text-grey-6 ellipsis">{{ project.path }}</div>
            </div>

            <!-- Tech Stack -->
            <div class="col-auto q-px-md row q-gutter-xs">
              <q-avatar v-for="tech in project.techs" :key="tech" size="28px" font-size="18px" color="grey-10" text-color="grey-5">
                <q-icon :name="getTechIcon(tech)" />
                <q-tooltip>{{ tech }}</q-tooltip>
              </q-avatar>
            </div>

            <!-- Git Status Indicators -->
            <div v-if="project.git" class="col-auto q-px-md text-center">
              <div class="row q-gutter-x-sm items-center">
                <div v-if="project.git.ahead > 0" class="text-positive text-caption text-weight-bold">
                  <q-icon name="cloud_upload" /> {{ project.git.ahead }}
                </div>
                <div v-if="project.git.behind > 0" class="text-negative text-caption text-weight-bold">
                  <q-icon name="cloud_download" /> {{ project.git.behind }}
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="col-auto q-gutter-x-sm">
              <q-btn v-if="project.git" flat round icon="download" color="blue-5" :loading="!!gitLoading[project.id + 'pull']" @click="handleGitPull(project)">
                <q-tooltip>Git Pull</q-tooltip>
              </q-btn>
              <q-btn v-if="project.git" flat round icon="upload" color="green-5" :loading="!!gitLoading[project.id + 'push']" @click="handleGitPush(project)">
                <q-tooltip>Git Push</q-tooltip>
              </q-btn>
              <q-btn flat round icon="code" color="primary" @click="projectsStore.openVsCode(project.path)">
                <q-tooltip>Open in VS Code</q-tooltip>
              </q-btn>
              <q-btn flat round icon="terminal" color="secondary" @click="projectsStore.openTerminal(project.path)">
                <q-tooltip>Open Terminal</q-tooltip>
              </q-btn>
              <q-btn flat round icon="folder" color="grey-5" @click="projectsStore.openFolder(project.path)">
                <q-tooltip>Reveal in File Explorer</q-tooltip>
              </q-btn>
              <q-btn flat round icon="delete_outline" color="red-5" @click="confirmDelete(project)">
                <q-tooltip>Remove Project</q-tooltip>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- Empty State -->
      <div v-if="projectsStore.projects.length === 0 && !projectsStore.loading" class="col-12 text-center q-pa-xl">
        <q-icon name="inventory_2" size="64px" color="grey-8" />
        <div class="text-grey-6 q-mt-md">No projects tracked yet.</div>
        <q-btn color="primary" label="Scan your workspace" @click="showScanDialog = true" class="q-mt-md" />
      </div>
    </div>

    <!-- Delete Confirmation -->
    <q-dialog v-model="showDeleteDialog">
      <q-card class="bg-grey-10 text-white" style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white" />
          <span class="q-ml-sm">Remove <strong>{{ projectToDelete?.name }}</strong> from dashboard?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey-5" v-close-popup />
          <q-btn flat label="Remove" color="red" @click="deleteProject" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Scan Dialog -->
    <q-dialog v-model="showScanDialog" backdrop-filter="blur(4px)">
      <q-card class="bg-grey-10 text-white" style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">Scan for Projects</div>
          <div class="text-caption text-grey-6">Recursively find Git repos and tech stacks.</div>
          <div v-if="!isElectron" class="text-caption text-warning q-mt-xs">
            <q-icon name="info" /> Manual path entry required for web mode.
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-gutter-sm items-center">
            <q-input 
              v-model="scanPath" 
              label="Root Directory Path" 
              filled 
              dark 
              color="primary" 
              class="col" 
              autofocus 
              @keyup.enter="startScan"
              placeholder="C:\Users\Name\Projects"
            />
            <q-btn v-if="isElectron" color="secondary" icon="folder" @click="browseFolder">
              <q-tooltip>Open File Picker</q-tooltip>
            </q-btn>
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-5" v-close-popup />
          <q-btn color="primary" label="Start Scan" unelevated @click="startScan" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProjectsStore } from '../../stores/projectsStore';
import { api } from '../../boot/axios';
import type { Project } from '../../stores/projectsStore';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const projectsStore = useProjectsStore();
const showScanDialog = ref(false);
const showDeleteDialog = ref(false);
const projectToDelete = ref<Project | null>(null);
const scanPath = ref('');
const gitLoading = ref<Record<string, boolean>>({});

const isElectron = computed(() => typeof window !== 'undefined' && !!window.electronApi);

const getTechIcon = (tech: string) => {
  const icons: Record<string, string> = {
    nodejs: 'javascript',
    vue: 'vuejs',
    react: 'rebase_edit',
    quasar: 'extension',
    typescript: 'terminal',
    python: 'settings_input_component',
    docker: 'dock',
    rust: 'settings_suggest',
    go: 'terminal',
    php: 'settings_input_hdmi'
  };
  return icons[tech] || 'code';
};

const startScan = async () => {
  if (scanPath.value) {
    try {
      await projectsStore.scanDirectory(scanPath.value);
      $q.notify({
        message: 'Scan completed. Lab synchronized.',
        color: 'positive',
        icon: 'sync',
        position: 'bottom-right'
      });
    } catch (e) {
      $q.notify({
        message: `Scan failed: ${String(e)}`,
        color: 'negative'
      });
    }
  }
};

const browseFolder = async () => {
  if (typeof window !== 'undefined' && window.electronApi) {
    const path = await window.electronApi.selectFolder();
    if (path) {
      scanPath.value = path;
    }
  }
};

const confirmDelete = (project: Project) => {
  projectToDelete.value = project;
  showDeleteDialog.value = true;
};

const handleGitPull = async (project: Project) => {
  const key = project.id + 'pull';
  gitLoading.value[key] = true;
  try {
    await projectsStore.gitPull(project.path);
    $q.notify({ message: `Pulled ${project.name}`, color: 'positive', icon: 'check' });
  } catch (e) {
    $q.notify({ message: `Pull failed: ${String(e)}`, color: 'negative' });
  } finally {
    gitLoading.value[key] = false;
  }
};

const handleGitPush = async (project: Project) => {
  const key = project.id + 'push';
  gitLoading.value[key] = true;
  try {
    await projectsStore.gitPush(project.path);
    $q.notify({ message: `Pushed ${project.name}`, color: 'positive', icon: 'check' });
  } catch (e) {
    $q.notify({ message: `Push failed: ${String(e)}`, color: 'negative' });
  } finally {
    gitLoading.value[key] = false;
  }
};

const deleteProject = async () => {
  if (projectToDelete.value) {
    await api.post('/api/projects/remove', { id: projectToDelete.value.id });
    await projectsStore.loadProjects();
    $q.notify({
      message: `${projectToDelete.value.name} removed`,
      color: 'info',
      icon: 'delete',
      position: 'bottom-right'
    });
    projectToDelete.value = null;
  }
};

onMounted(() => {
  void projectsStore.loadProjects();
});
</script>

<style lang="sass" scoped>
.project-row
  transition: background 0.2s ease
  &:hover
    background: rgba($primary, 0.05)
</style>
