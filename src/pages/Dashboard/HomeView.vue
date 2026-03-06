<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <!-- System Overview Mini-Header -->
      <div class="col-12">
        <div class="row items-center q-gutter-x-md q-mb-xs">
          <div class="text-h5 text-wcag-bold tracking-tight">{{ $t('dashboard.title') }}</div>
          <q-badge :color="backendOnline ? 'positive' : 'negative'" class="text-weight-bolder" size="sm">
            <q-icon :name="backendOnline ? 'cloud_done' : 'cloud_off'" class="q-mr-xs" />
            {{ backendOnline ? 'OS OK' : 'OFFLINE' }}
          </q-badge>
          <q-space />
          <div class="text-wcag-caption text-caption text-weight-bold">
            {{ systemStore.stats?.platform }} | {{ systemStore.stats?.uptime ? formatUptime(systemStore.stats.uptime) : '-' }}
          </div>
        </div>
      </div>

      <!-- Detailed but Compact System Resources -->
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <!-- CPU -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card bordered flat class="compact-resource-card border-cpu">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon name="memory" color="primary" size="18px" class="q-mr-xs" />
                  <div class="text-overline text-wcag-bold opacity-70" style="font-size: 0.6rem">CPU</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">{{ systemStore.stats?.cpuLoad || 0 }}%</div>
                <div class="text-caption text-wcag-caption" style="font-size: 0.7rem">({{ systemStore.stats?.cpuCores || '-' }} cores)</div>
                <q-linear-progress :value="(systemStore.stats?.cpuLoad || 0) / 100" color="primary" class="q-mt-xs" style="height: 3px" />
              </q-card-section>
            </q-card>
          </div>

          <!-- RAM -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card bordered flat class="compact-resource-card border-ram">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon name="mdi-memory" color="secondary" size="18px" class="q-mr-xs" />
                  <div class="text-overline text-wcag-bold opacity-70" style="font-size: 0.6rem">RAM</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">
                  {{ systemStore.stats?.memUsed || '0' }}/{{ systemStore.stats?.memTotal || '0' }} GB
                </div>
                <div class="text-caption text-wcag-caption" style="font-size: 0.7rem">{{ systemStore.stats?.memPercent || 0 }}% used</div>
                <q-linear-progress :value="(systemStore.stats?.memPercent || 0) / 100" color="secondary" class="q-mt-xs" style="height: 3px" />
              </q-card-section>
            </q-card>
          </div>

          <!-- DISK -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card bordered flat class="compact-resource-card border-disk">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon name="storage" color="accent" size="18px" class="q-mr-xs" />
                  <div class="text-overline text-wcag-bold opacity-70" style="font-size: 0.6rem">DISK</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">
                  {{ systemStore.stats?.diskUsed || '0' }}/{{ systemStore.stats?.diskTotal || '0' }} GB
                </div>
                <div class="text-caption text-wcag-caption" style="font-size: 0.7rem">{{ systemStore.stats?.diskPercent || 0 }}% used</div>
                <q-linear-progress :value="(systemStore.stats?.diskPercent || 0) / 100" color="accent" class="q-mt-xs" style="height: 3px" />
              </q-card-section>
            </q-card>
          </div>

          <!-- LOAD -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card bordered flat class="compact-resource-card border-load">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon name="speed" color="warning" size="18px" class="q-mr-xs" />
                  <div class="text-overline text-wcag-bold opacity-70" style="font-size: 0.6rem">LOAD (1/5/15)</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">
                  {{ formatFullLoad(systemStore.stats?.loadAvg) }}
                </div>
                <div class="text-caption text-wcag-caption" style="font-size: 0.7rem">System Averages</div>
                <q-linear-progress :value="((systemStore.stats?.loadAvg?.[0] || 0) * 10) / 100" color="warning" class="q-mt-xs" style="height: 3px" />
              </q-card-section>
            </q-card>
          </div>

          <!-- NET -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card bordered flat class="compact-resource-card border-net">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon name="lan" color="info" size="18px" class="q-mr-xs" />
                  <div class="text-overline text-wcag-bold opacity-70" style="font-size: 0.6rem">NET (SINCE BOOT)</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2 no-wrap ellipsis">
                  <span class="text-positive">{{ formatNet(systemStore.stats?.netSent) }}</span> / <span class="text-info">{{ formatNet(systemStore.stats?.netRecv) }}</span>
                </div>
                <div class="text-caption text-wcag-caption" style="font-size: 0.7rem">Sent / Recv</div>
                <q-linear-progress :value="0.5" color="info" class="q-mt-xs" style="height: 3px" />
              </q-card-section>
            </q-card>
          </div>

          <!-- STATUS -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card bordered flat class="compact-resource-card border-info">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon name="info" color="success" size="18px" class="q-mr-xs" />
                  <div class="text-overline text-wcag-bold opacity-70" style="font-size: 0.6rem">INFO</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">{{ systemStore.stats?.platform || '-' }}</div>
                <div class="text-caption text-wcag-caption" style="font-size: 0.7rem">Uptime: {{ systemStore.stats?.uptime ? formatUptime(systemStore.stats.uptime) : '-' }}</div>
                <q-linear-progress :value="1" color="success" class="q-mt-xs" style="height: 3px" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Quick Actions Small -->
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-btn 
              unelevated 
              class="full-width action-btn-small bg-gradient-primary text-white shadow-glow-primary" 
              to="/projects"
            >
              <q-icon name="terminal" size="20px" class="q-mr-sm" />
              <div class="text-weight-bolder">{{ totalProjects }} Projects</div>
              <q-space />
              <q-icon name="chevron_right" />
            </q-btn>
          </div>
          <div class="col-12 col-sm-6">
            <q-btn 
              unelevated 
              class="full-width action-btn-small bg-gradient-secondary text-white shadow-glow-primary" 
              to="/bookmarks"
            >
              <q-icon name="bookmark" size="20px" class="q-mr-sm" />
              <div class="text-weight-bolder">{{ totalBookmarks }} Bookmarks</div>
              <q-space />
              <q-icon name="chevron_right" />
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="col-12">
        <div class="text-overline text-wcag-bold q-mb-xs q-mt-md">{{ $t('dashboard.recentProjects') }}</div>
        <q-list bordered separator class="rounded-borders bg-card shadow-1">
          <q-item v-for="project in recentProjects" :key="project.id" clickable v-ripple @click="openVsCode(project.path)" dense class="q-py-xs">
            <q-item-section avatar>
              <q-icon name="folder" color="primary" size="20px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-wcag" style="font-size: 0.9rem">{{ project.name }}</q-item-label>
              <q-item-label caption class="text-wcag-caption ellipsis" style="font-size: 0.75rem">{{ project.path }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row q-gutter-xs">
                <q-badge v-for="tech in (project.techs || []).slice(0, 3)" :key="tech" outline color="primary" size="sm" class="text-weight-bold" style="font-size: 0.65rem">
                  {{ tech }}
                </q-badge>
              </div>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round dense icon="mdi-microsoft-visual-studio-code" size="sm" color="primary" @click.stop="openVsCode(project.path)" />
            </q-item-section>
          </q-item>
          
          <q-item v-if="recentProjects.length === 0" class="text-center q-pa-md">
            <q-item-section class="text-wcag-caption italic">{{ $t('dashboard.noProjects') }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useSystemStore } from '../../stores/systemStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { api } from '../../boot/axios';

const systemStore = useSystemStore();
const projectsStore = useProjectsStore();
const bookmarksStore = useBookmarksStore();
const settingsStore = useSettingsStore();

const backendOnline = ref(false);
let statsInterval: ReturnType<typeof setInterval> | undefined;

const recentProjects = computed(() => projectsStore.projects.slice(0, 5));
const totalProjects = computed(() => projectsStore.projects.length);
const totalBookmarks = computed(() => bookmarksStore.bookmarks.length);

const formatUptime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
};

const formatFullLoad = (avg?: number[]) => {
  if (!avg || !Array.isArray(avg)) return '-';
  return avg.map(v => v.toFixed(2)).join(' / ');
};

const formatNet = (mb?: number) => {
  if (!mb) return '0MB';
  return mb > 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${mb.toFixed(0)}MB`;
};

const openVsCode = (path: string) => {
  void projectsStore.openVsCode(path);
};

onMounted(async () => {
  try {
    const ping = await api.get('/api/system/stats').catch(() => null);
    backendOnline.value = !!ping?.data;
    await Promise.all([systemStore.fetchStats(), projectsStore.loadProjects(), bookmarksStore.loadBookmarks()]);
  } catch (e) { console.error(e); }
  
  statsInterval = setInterval(() => {
    void (async () => {
      try {
        await systemStore.fetchStats();
        backendOnline.value = true;
        if (settingsStore.settings.autoCheckPorts) await projectsStore.syncAll();
      } catch { backendOnline.value = false; }
    })();
  }, 5000);
});

onUnmounted(() => { if (statsInterval) clearInterval(statsInterval); });
</script>

<style lang="sass" scoped>
.compact-resource-card
  border-left: 4px solid var(--dd-border)
  border-radius: 8px
  background: var(--dd-card-bg)
  
.border-cpu
  border-left-color: var(--dd-primary) !important
.border-ram
  border-left-color: var(--dd-secondary) !important
.border-disk
  border-left-color: var(--dd-accent) !important
.border-load
  border-left-color: var(--dd-warning) !important
.border-net
  border-left-color: var(--dd-info) !important
.border-info
  border-left-color: var(--dd-success) !important

.action-btn-small
  height: 44px
  border-radius: 10px
  text-transform: none

.bg-card
  background: var(--dd-card-bg)

.tracking-tight
  letter-spacing: -1px
</style>
