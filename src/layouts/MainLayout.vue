<template>
  <q-layout view="lHh Lpr lFf" class="bg-mesh">
    <q-header flat class="bg-transparent text-wcag q-py-sm">
      <q-toolbar class="q-px-md">
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          :aria-label="$t('nav.toggleMenu')"
          @click="toggleLeftDrawer"
          class="shadow-glow-primary"
        >
          <q-tooltip>{{ $t('nav.toggleMenu') }}</q-tooltip>
        </q-btn>

        <q-toolbar-title class="row items-center no-wrap">
          <q-icon name="mdi-console" class="q-mr-sm" color="primary" size="32px" />
          <div class="text-h5 text-wcag-bold tracking-tight">DEV DASHBOARD</div>
        </q-toolbar-title>

        <q-btn flat round dense icon="mdi-bell-outline" color="primary" :aria-label="$t('nav.notifications')">
          <q-tooltip>{{ $t('nav.notifications') }}</q-tooltip>
          <q-badge v-if="systemStore.notifications.length" floating color="negative" rounded size="xs" />
          <q-menu class="rounded-borders shadow-2" style="width: 350px">
            <q-list bordered separator>
              <q-item-label header class="row items-center q-py-sm">
                <span class="text-weight-bolder">{{ $t('nav.recentActivity') }}</span>
                <q-space />
                <q-btn flat round dense icon="mdi-close-circle-outline" size="sm" color="grey-7" @click="systemStore.clearNotifications()" :aria-label="$t('nav.clearAll')">
                  <q-tooltip>{{ $t('nav.clearAll') }}</q-tooltip>
                </q-btn>
              </q-item-label>
              
              <q-item v-for="notif in systemStore.notifications" :key="notif.id" class="q-py-sm">
                <q-item-section avatar>
                  <q-avatar :color="notif.color + '-transparent'" :text-color="notif.color" size="40px">
                    <q-icon :name="'mdi-' + (notif.icon === 'search' ? 'magnify' : (notif.icon === 'history' ? 'history' : 'check'))" size="20px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-wcag">{{ notif.message }}</q-item-label>
                  <q-item-label caption class="text-wcag-caption">{{ notif.time }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="!systemStore.notifications.length" class="text-center q-pa-md text-wcag-caption italic">
                {{ $t('nav.noNotifications') }}
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-glass border-right"
      :width="240"
    >
      <q-list class="q-mt-lg">
        <q-item
          v-for="link in essentialLinks"
          :key="link.title"
          clickable
          v-ripple
          :to="link.link"
          :exact="link.link === '/'"
          class="q-mb-sm rounded-borders q-mx-md nav-item"
          active-class="bg-gradient-primary text-white shadow-glow-primary active-nav"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" size="24px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bolder tracking-wide" style="font-size: 0.9rem">{{ $t(link.title) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="absolute-bottom q-pa-md text-center text-wcag-caption opacity-50" style="font-size: 0.7rem">
        v0.0.1 | LOCAL FIRST
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSystemStore } from '../stores/systemStore';

const systemStore = useSystemStore();
const leftDrawerOpen = ref(false);

const essentialLinks = [
  { title: 'nav.dashboard', icon: 'mdi-view-dashboard', link: '/' },
  { title: 'nav.projects', icon: 'mdi-folder-multiple', link: '/projects' },
  { title: 'nav.bookmarks', icon: 'mdi-bookmark-multiple', link: '/bookmarks' },
  { title: 'nav.settings', icon: 'mdi-cog', link: '/settings' },
];

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style lang="sass" scoped>
.nav-item
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  color: var(--dd-text-secondary)
  border: 1px solid transparent
  
  &:hover:not(.active-nav)
    background: rgba(var(--dd-primary), 0.05)
    color: var(--dd-primary)
    border-color: var(--dd-border)
    transform: translateX(4px)

.active-nav
  // Text color is handled by .bg-gradient-primary in app.sass
  // but we ensure it overrides any local secondary text colors
  .q-item__label
    color: inherit !important
  .q-icon
    color: inherit !important

.tracking-wide
  letter-spacing: 0.5px

.tracking-tight
  letter-spacing: -1.5px

.bg-glass
  background: var(--dd-card-bg) !important
  backdrop-filter: blur(10px)

.border-right
  border-right: 1px solid var(--dd-border) !important
</style>
