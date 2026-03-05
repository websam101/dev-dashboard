<template>
  <q-page class="q-pa-lg">
    <!-- Defensive wrapper to prevent SSR hydration mismatches entirely -->
    <div v-if="mounted">
      <div class="row q-col-gutter-lg">
        <!-- Welcome Section -->
        <div class="col-12">
          <div class="text-h4 text-weight-bold q-mb-xs text-grey-3">Dashboard</div>
          <div class="text-grey-6">System Overview & Quick Access</div>
        </div>

        <!-- System Overview -->
        <div class="col-12 col-md-4">
          <q-card bordered flat class="stats-card bg-grey-9">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <q-icon name="monitor_heart" color="primary" size="24px" class="q-mr-sm" />
                <div class="text-h6 text-grey-3">System Resources</div>
              </div>
              
              <div class="row q-col-gutter-md">
                <div class="col-6 text-center">
                  <q-circular-progress
                    show-value
                    font-size="16px"
                    :value="systemStore.stats?.cpuLoad || 0"
                    size="100px"
                    :thickness="0.15"
                    color="primary"
                    track-color="grey-8"
                    center-color="grey-10"
                  >
                    <div class="text-weight-bold">{{ systemStore.stats?.cpuLoad || 0 }}%</div>
                    <div class="text-caption text-grey-6" style="font-size: 10px">CPU Load</div>
                  </q-circular-progress>
                </div>
                <div class="col-6 text-center">
                  <q-circular-progress
                    show-value
                    font-size="16px"
                    :value="systemStore.stats?.memPercent || 0"
                    size="100px"
                    :thickness="0.15"
                    color="secondary"
                    track-color="grey-8"
                    center-color="grey-10"
                  >
                    <div class="text-weight-bold">{{ systemStore.stats?.memPercent || 0 }}%</div>
                    <div class="text-caption text-grey-6" style="font-size: 10px">{{ systemStore.stats?.memUsed || 0 }} GB</div>
                  </q-circular-progress>
                </div>
              </div>
              
              <q-separator class="q-my-md bg-grey-8" />
              
              <div class="row items-center justify-between text-grey-5 text-caption">
                <div>Uptime: {{ systemStore.stats?.uptime ? formatUptime(systemStore.stats.uptime) : '-' }}</div>
                <div>Platform: {{ systemStore.stats?.platform || 'Unknown' }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Quick Status -->
        <div class="col-12 col-md-8">
          <div class="row q-col-gutter-md full-height">
            <div class="col-12 col-sm-6">
              <q-card bordered flat class="bg-grey-9 full-height flex column justify-center items-center q-py-lg text-center">
                <template v-if="!projectsStore.loading">
                  <div class="text-h2 text-primary text-weight-bolder">{{ totalProjects }}</div>
                  <div class="text-subtitle1 text-grey-5 q-mt-sm">Active Projects</div>
                </template>
                <q-spinner v-else color="primary" size="2em" />
                <q-btn flat color="primary" label="Manage Projects" to="/projects" class="q-mt-sm" />
              </q-card>
            </div>
            <div class="col-12 col-sm-6">
              <q-card bordered flat class="bg-grey-9 full-height flex column justify-center items-center q-py-lg text-center">
                <template v-if="!bookmarksStore.loading">
                  <div class="text-h2 text-accent text-weight-bolder">{{ totalBookmarks }}</div>
                  <div class="text-subtitle1 text-grey-5 q-mt-sm">Saved Bookmarks</div>
                </template>
                <q-spinner v-else color="accent" size="2em" />
                <q-btn flat color="accent" label="View Library" to="/bookmarks" class="q-mt-sm" />
              </q-card>
            </div>
          </div>
        </div>

        <!-- Recent Projects -->
        <div class="col-12">
          <div class="row items-center q-mb-md">
            <div class="text-h6 text-weight-medium">Recent Projects</div>
            <q-space />
            <q-btn outline color="primary" label="View All" to="/projects" size="sm" />
          </div>
          
          <div class="row q-col-gutter-md">
            <div v-for="project in recentProjects" :key="project.id" class="col-12 col-sm-6 col-md-4">
              <q-card bordered flat class="bg-grey-9 project-card" @click="openVsCode(project.path)">
                <q-card-section>
                  <div class="row items-center no-wrap q-mb-sm">
                    <q-icon name="folder" color="primary" size="20px" class="q-mr-sm" />
                    <div class="text-subtitle1 text-weight-bold ellipsis">{{ project.name }}</div>
                    <q-space />
                    <q-icon name="arrow_forward" color="grey-7" size="16px" />
                  </div>
                  <div class="text-caption text-grey-6 ellipsis q-mb-md">{{ project.path }}</div>
                  
                  <div class="row q-gutter-xs">
                    <q-badge v-for="tech in (project.techs || []).slice(0, 3)" :key="tech" color="grey-8" text-color="grey-4">
                      {{ tech }}
                    </q-badge>
                    <q-badge v-if="(project.techs || []).length > 3" color="grey-8" text-color="grey-4">+{{ project.techs.length - 3 }}</q-badge>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <!-- Empty State -->
            <div v-if="recentProjects.length === 0 && !projectsStore.loading" class="col-12">
              <q-card bordered flat class="bg-grey-9 q-pa-lg text-center dashed-border">
                <div class="text-grey-5 q-mb-md">No projects found. Scan your directory to get started.</div>
                <q-btn color="primary" label="Scan Directory" to="/projects" />
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Placeholder while mounting -->
    <div v-else class="flex flex-center q-pa-xl">
      <q-spinner-grid color="primary" size="4em" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useSystemStore } from '../../stores/systemStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useBookmarksStore } from '../../stores/bookmarksStore';

const systemStore = useSystemStore();
const projectsStore = useProjectsStore();
const bookmarksStore = useBookmarksStore();

const mounted = ref(false);
let statsInterval: ReturnType<typeof setInterval> | undefined;

const recentProjects = computed(() => {
  const list = projectsStore.projects;
  return Array.isArray(list) ? list.slice(0, 3) : [];
});

const totalProjects = computed(() => {
  const list = projectsStore.projects;
  return Array.isArray(list) ? list.length : 0;
});

const totalBookmarks = computed(() => {
  const list = bookmarksStore.bookmarks;
  return Array.isArray(list) ? list.length : 0;
});

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 3600));
  const hrs = Math.floor((seconds % (24 * 3600)) / 3600);
  return days > 0 ? `${days}d ${hrs}h` : `${hrs}h`;
};

const openVsCode = (path: string) => {
  void projectsStore.openVsCode(path);
};

onMounted(async () => {
  mounted.value = true;
  try {
    await Promise.all([
      systemStore.fetchStats(),
      projectsStore.loadProjects(),
      bookmarksStore.loadBookmarks()
    ]);
  } catch (e) {
    console.error('Initial load failed', e);
  }
  
  statsInterval = setInterval(() => {
    void systemStore.fetchStats();
  }, 5000);
});

onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval);
});
</script>

<style lang="sass" scoped>
.stats-card
  height: 100%
.project-card
  cursor: pointer
  transition: all 0.3s ease
  &:hover
    border-color: var(--q-primary)
    transform: translateY(-2px)
.dashed-border
  border: 2px dashed rgba(255,255,255,0.1)
  border-radius: 12px
</style>
