<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-sm">
      <!-- System Overview Mini-Header -->
      <div class="col-12">
        <div class="row items-center q-gutter-x-md q-mb-xs">
          <h1 class="text-h5 text-wcag-bold tracking-tight q-my-none">{{ $t('dashboard.title') }}</h1>
          <q-badge
            :color="backendOnline ? 'positive' : 'negative'"
            class="text-weight-bolder"
            size="sm"
          >
            <q-icon
              :name="backendOnline ? 'cloud_done' : 'cloud_off'"
              class="q-mr-xs"
            />
            {{ backendOnline ? $t('dashboard.backendOnlineShort') : $t('dashboard.backendOfflineShort') }}
          </q-badge>
          <q-space />
          <div class="text-wcag-caption text-caption text-weight-bold">
            {{ systemStore.stats?.platform }} | {{ systemStore.stats?.uptime ? formatUptime(systemStore.stats.uptime) :
              '-' }}
          </div>
        </div>
      </div>

      <!-- Detailed but Compact System Resources -->
      <div class="col-12">
        <div class="row q-col-gutter-sm">
          <!-- CPU -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card
              bordered
              flat
              class="compact-resource-card border-cpu"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon
                    name="memory"
                    color="primary"
                    size="18px"
                    class="q-mr-xs"
                  />
                  <div
                    class="text-overline text-wcag-bold opacity-70"
                    style="font-size: 0.6rem"
                  >{{ $t('dashboard.cpu') }}</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">{{ systemStore.stats?.cpuLoad || 0 }}%
                </div>
                <div
                  class="text-caption text-wcag-caption"
                  style="font-size: 0.7rem"
                >({{ systemStore.stats?.cpuCores || '-' }} {{ $t('dashboard.cores') }})</div>
                <q-linear-progress
                  :value="(systemStore.stats?.cpuLoad || 0) / 100"
                  color="primary"
                  class="q-mt-xs"
                  style="height: 3px"
                  :aria-label="$t('dashboard.cpu')"
                />
                <q-tooltip>{{ $t('dashboard.cpuTooltip', {
                  load: systemStore.stats?.cpuLoad || 0, cores:
                    systemStore.stats?.cpuCores || '-'
                }) }}</q-tooltip>
              </q-card-section>
            </q-card>
          </div>

          <!-- RAM -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card
              bordered
              flat
              class="resource-card border-ram compact-resource-card"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon
                    name="mdi-memory"
                    color="secondary"
                    size="18px"
                    class="q-mr-xs"
                  />
                  <div
                    class="text-overline text-wcag-bold opacity-70"
                    style="font-size: 0.6rem"
                  >{{ $t('dashboard.ram') }}</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">
                  {{ systemStore.stats?.memUsed || '0' }}/{{ systemStore.stats?.memTotal || '0' }} GB
                </div>
                <div
                  class="text-caption text-wcag-caption"
                  style="font-size: 0.7rem"
                >{{ systemStore.stats?.memPercent || 0 }}% {{ $t('dashboard.used') }}</div>
                <q-linear-progress
                  :value="(systemStore.stats?.memPercent || 0) / 100"
                  color="secondary"
                  class="q-mt-xs"
                  style="height: 3px"
                  :aria-label="$t('dashboard.ram')"
                />
                <q-tooltip>{{ $t('dashboard.ramTooltip', {
                  used: systemStore.stats?.memUsed || '0', total:
                    systemStore.stats?.memTotal || '0'
                }) }}</q-tooltip>
              </q-card-section>
            </q-card>
          </div>

          <!-- DISK -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card
              bordered
              flat
              class="resource-card border-disk compact-resource-card"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon
                    name="storage"
                    color="accent"
                    size="18px"
                    class="q-mr-xs"
                  />
                  <div
                    class="text-overline text-wcag-bold opacity-70"
                    style="font-size: 0.6rem"
                  >{{ $t('dashboard.disk') }}</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">
                  {{ systemStore.stats?.diskUsed || '0' }}/{{ systemStore.stats?.diskTotal || '0' }} GB
                </div>
                <div
                  class="text-caption text-wcag-caption"
                  style="font-size: 0.7rem"
                >{{ systemStore.stats?.diskPercent || 0 }}% {{ $t('dashboard.used') }}</div>
                <q-linear-progress
                  :value="(systemStore.stats?.diskPercent || 0) / 100"
                  color="accent"
                  class="q-mt-xs"
                  style="height: 3px"
                  :aria-label="$t('dashboard.disk')"
                />
                <q-tooltip>{{ $t('dashboard.diskTooltip', {
                  used: systemStore.stats?.diskUsed || '0', total:
                    systemStore.stats?.diskTotal || '0'
                }) }}</q-tooltip>
              </q-card-section>
            </q-card>
          </div>

          <!-- LOAD -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card
              bordered
              flat
              class="resource-card border-load compact-resource-card"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon
                    name="speed"
                    color="warning"
                    size="18px"
                    class="q-mr-xs"
                  />
                  <div
                    class="text-overline text-wcag-bold opacity-70"
                    style="font-size: 0.6rem"
                  >{{ $t('dashboard.loadHeader') }}</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">
                  {{ formatFullLoad(systemStore.stats?.loadAvg) }}
                </div>
                <div
                  class="text-caption text-wcag-caption"
                  style="font-size: 0.7rem"
                >{{ $t('dashboard.loadAvg') }}</div>
                <q-linear-progress
                  :value="Math.min(((systemStore.stats?.loadAvg?.[0] || 0) * 10), 100) / 100"
                  color="warning"
                  class="q-mt-xs"
                  style="height: 3px"
                  :aria-label="$t('dashboard.loadHeader')"
                />
                <q-tooltip>{{ $t('dashboard.loadTooltip') }}</q-tooltip>
              </q-card-section>
            </q-card>
          </div>

          <!-- NET -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card
              bordered
              flat
              class="resource-card border-net compact-resource-card"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon
                    name="lan"
                    color="info"
                    size="18px"
                    class="q-mr-xs"
                  />
                  <div
                    class="text-overline text-wcag-bold opacity-70"
                    style="font-size: 0.6rem"
                  >{{ $t('dashboard.netHeader') }}</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2 no-wrap ellipsis">
                  <span class="text-positive">{{ formatNet(systemStore.stats?.netSent) }}</span> / <span
                    class="text-info"
                  >{{ formatNet(systemStore.stats?.netRecv) }}</span>
                </div>
                <div
                  class="text-caption text-wcag-caption"
                  style="font-size: 0.7rem"
                >{{ $t('dashboard.sentRecv') }}</div>
                <q-linear-progress
                  :value="0.5"
                  color="info"
                  class="q-mt-xs"
                  style="height: 3px"
                  :aria-label="$t('dashboard.netHeader')"
                />
                <q-tooltip>{{ $t('dashboard.netTooltip') }}</q-tooltip>
              </q-card-section>
            </q-card>
          </div>

          <!-- INFO -->
          <div class="col-12 col-sm-4 col-md-2">
            <q-card
              bordered
              flat
              class="resource-card border-info compact-resource-card"
            >
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <q-icon
                    name="info"
                    color="success"
                    size="18px"
                    class="q-mr-xs"
                  />
                  <div
                    class="text-overline text-wcag-bold opacity-70"
                    style="font-size: 0.6rem"
                  >INFO</div>
                </div>
                <div class="text-weight-bolder text-wcag-bold text-subtitle2">{{ systemStore.stats?.platform || '-' }}
                </div>
                <div
                  class="text-caption text-wcag-caption"
                  style="font-size: 0.7rem"
                >{{ $t('dashboard.uptimeLabel') }}: {{ systemStore.stats?.uptime ?
                  formatUptime(systemStore.stats.uptime) : '-' }}</div>
                <q-linear-progress
                  :value="1"
                  color="success"
                  class="q-mt-xs"
                  style="height: 3px"
                  :aria-label="$t('dashboard.uptimeLabel')"
                />
                <q-tooltip>{{ systemStore.stats?.platform || '-' }} | {{ systemStore.stats?.uptime ?
                  formatUptime(systemStore.stats.uptime) : '-' }}</q-tooltip>
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
              <q-icon
                name="terminal"
                size="20px"
                class="q-mr-sm"
              />
              <div class="text-weight-bolder">{{ totalProjects }} {{ $t('nav.projects') }}</div>
              <q-space />
              <q-icon name="chevron_right" />
              <q-tooltip>{{ $t('dashboard.manageProjects') }}</q-tooltip>
            </q-btn>
          </div>
          <div class="col-12 col-sm-6">
            <q-btn
              unelevated
              class="full-width action-btn-small bg-gradient-secondary text-white shadow-glow-primary"
              to="/bookmarks"
            >
              <q-icon
                name="bookmark"
                size="20px"
                class="q-mr-sm"
              />
              <div class="text-weight-bolder">{{ totalBookmarks }} {{ $t('bookmarks.title') }}</div>
              <q-space />
              <q-icon name="chevron_right" />
              <q-tooltip>{{ $t('dashboard.viewLibrary') }}</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Quick Access Favorites (2 Columns) -->
      <div class="col-12">
        <div class="row q-col-gutter-md">
          <!-- Favorite Projects -->
          <div class="col-12 col-md-6">
            <div class="text-overline text-wcag-bold q-mb-xs q-mt-md">{{ $t('dashboard.favoriteProjects') }}</div>
            <q-list
              bordered
              separator
              class="rounded-borders bg-card shadow-1"
            >
              <q-item
                v-for="project in favoriteProjects"
                :key="project.id"
                clickable
                v-ripple
                @click="openVsCode(project.path)"
                dense
                class="q-py-xs"
              >
                <q-item-section avatar>
                  <q-icon
                    name="folder"
                    color="primary"
                    size="20px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="text-weight-bold text-wcag"
                    style="font-size: 0.9rem"
                  >{{ project.name }}</q-item-label>
                  <q-item-label
                    caption
                    class="text-wcag-caption ellipsis"
                    style="font-size: 0.75rem"
                  >{{ project.path }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-badge
                      v-for="tech in (project.techs || []).slice(0, 3)"
                      :key="tech"
                      outline
                      color="primary"
                      size="sm"
                      class="text-weight-bold"
                      style="font-size: 0.65rem"
                    >
                      {{ tech }}
                    </q-badge>
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="mdi-microsoft-visual-studio-code"
                    size="sm"
                    color="primary"
                    @click.stop="openVsCode(project.path)"
                    :aria-label="$t('projects.openVsCode')"
                  >
                    <q-tooltip>{{ $t('projects.openVsCode') }}</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>

              <q-item
                v-if="favoriteProjects.length === 0"
                class="text-center q-pa-md"
              >
                <q-item-section class="text-wcag-caption italic">{{ $t('dashboard.noFavorites') }}</q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Favorite Bookmarks -->
          <div class="col-12 col-md-6">
            <div class="text-overline text-wcag-bold q-mb-xs q-mt-md">{{ $t('bookmarks.pinned') }}</div>
            <q-list
              bordered
              separator
              class="rounded-borders bg-card shadow-1"
            >
              <q-item
                v-for="bookmark in favoriteBookmarks"
                :key="bookmark.id"
                clickable
                v-ripple
                @click="openLink(bookmark.url)"
                dense
                class="q-py-xs"
              >
                <q-item-section avatar>
                  <q-avatar
                    rounded
                    size="24px"
                  >
                    <FaviconRenderer :url="bookmark.url" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="text-weight-bold text-wcag row items-center no-wrap"
                    style="font-size: 0.9rem"
                  >
                    <div class="ellipsis">{{ bookmark.title }}</div>
                  </q-item-label>
                  <q-item-label
                    caption
                    class="text-wcag-caption ellipsis"
                    style="font-size: 0.75rem"
                  >{{ bookmark.url }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row q-gutter-xs">
                    <q-badge
                      v-for="tag in (bookmark.tags || []).slice(0, 2)"
                      :key="tag"
                      outline
                      color="secondary"
                      size="sm"
                      class="text-weight-bold"
                      style="font-size: 0.65rem"
                    >
                      {{ tag }}
                    </q-badge>
                  </div>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    round
                    dense
                    icon="open_in_new"
                    size="sm"
                    color="primary"
                    @click.stop="openLink(bookmark.url)"
                    :aria-label="$t('bookmarks.openLinkHint')"
                  >
                    <q-tooltip>{{ $t('bookmarks.openLinkHint') }}</q-tooltip>
                  </q-btn>
                </q-item-section>
              </q-item>

              <q-item
                v-if="favoriteBookmarks.length === 0"
                class="text-center q-pa-md"
              >
                <q-item-section class="text-wcag-caption italic">{{ $t('bookmarks.noPinned') }}</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>
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
import { api } from '../../boot/api';
import FaviconRenderer from '../../components/FaviconRenderer.vue';

const systemStore = useSystemStore();
const projectsStore = useProjectsStore();
const bookmarksStore = useBookmarksStore();
const settingsStore = useSettingsStore();

const backendOnline = ref(false);
let statsInterval: ReturnType<typeof setInterval> | undefined;

const favoriteProjects = computed(() => projectsStore.projects.filter(p => p.favorite));
const favoriteBookmarks = computed(() => bookmarksStore.bookmarks.filter(b => b.favorite));
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

const openLink = (url: string) => {
  if (typeof window !== 'undefined') window.open(url, '_blank');
};

onMounted(async () => {
  try {
    const ping = await api.get('/api/system/stats').catch(() => null);
    backendOnline.value = !!ping?.data;

    // Sequential load to reduce initial burst of requests/CPU spikes
    await systemStore.fetchStats();
    await projectsStore.loadProjects();
    await bookmarksStore.loadBookmarks();

    // Delayed initial port scan (3s after boot data is ready)
    // Only happens once per session/boot
    if (!projectsStore.hasInitiallySynced) {
      setTimeout(() => {
        if (backendOnline.value && settingsStore.settings.autoCheckPorts) {
          void projectsStore.syncAll(false);
          projectsStore.hasInitiallySynced = true;
        }
      }, 3000);
    }
  } catch (e) { console.error(e); }

  // Interval for periodic updates (already increased to 15s)
  statsInterval = setInterval(() => {
    void (async () => {
      try {
        await systemStore.fetchStats();
        backendOnline.value = true;
        // Lightweight background sync for PORTS only (no disk scan)
        if (backendOnline.value && settingsStore.settings.autoCheckPorts) {
          await projectsStore.syncAll(false);
        }
      } catch {
        backendOnline.value = false;
      }
    })();
  }, 15000);
});

onUnmounted(() => { if (statsInterval) clearInterval(statsInterval); });
</script>

<style lang="sass" scoped>
.compact-resource-card
  border-left: 4px solid var(--dd-border)
  border-radius: 8px
  background: var(--dd-card-bg)

.border-cpu
  border-left-color: var(--dd-c6) !important
.border-ram
  border-left-color: var(--dd-c2) !important
.border-disk
  border-left-color: var(--dd-c3) !important
.border-load
  border-left-color: var(--dd-warning) !important
.border-net
  border-left-color: var(--dd-c1) !important
.border-info
  border-left-color: var(--dd-c5) !important

.action-btn-small
  height: 44px
  border-radius: 10px
  text-transform: none

.bg-card
  background: var(--dd-card-bg)

.tracking-tight
  letter-spacing: -1px
</style>
