<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="q-py-xs shadow-1">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          :aria-label="$t('layout.menu')"
          @click="toggleLeftDrawer"
          color="primary"
        />

        <q-toolbar-title class="text-weight-bolder row items-center text-primary" style="font-size: 1.4rem; letter-spacing: -0.5px">
          <q-icon name="mdi-console" class="q-mr-sm" color="primary" size="32px" />
          {{ $t('layout.appTitle') }}
        </q-toolbar-title>

        <q-btn flat round dense icon="mdi-bell-outline" color="primary">
          <q-badge color="negative" floating rounded dot v-if="systemStore.notifications.length > 0" />
          <q-menu class="border-accent shadow-10">
            <q-list style="min-width: 320px" class="q-pa-sm">
              <div class="row items-center justify-between q-pa-md border-bottom q-mb-sm">
                <div class="text-h6 text-weight-bolder text-wcag-bold">{{ $t('layout.recentActivity') }}</div>
                <q-btn 
                  flat 
                  dense 
                  color="primary" 
                  :label="$t('layout.clearAll')" 
                  size="sm" 
                  @click="systemStore.clearNotifications" 
                  v-if="systemStore.notifications.length > 0" 
                  class="text-weight-bolder"
                />
              </div>
              
              <q-item v-for="notif in systemStore.notifications" :key="notif.id" class="q-py-md rounded-borders q-mb-xs">
                <q-item-section avatar>
                  <q-avatar :color="notif.color + '-transparent'" :text-color="notif.color" size="40px">
                    <q-icon :name="'mdi-' + (notif.icon === 'search' ? 'magnify' : (notif.icon === 'history' ? 'history' : 'check'))" size="20px" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-wcag">{{ notif.message }}</q-item-label>
                  <q-item-label caption class="text-wcag-caption text-weight-medium">{{ notif.time }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item v-if="systemStore.notifications.length === 0" class="text-center q-pa-xl">
                <q-item-section class="text-wcag-caption italic opacity-60">{{ $t('layout.noNotifications') }}</q-item-section>
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
      :width="280"
      class="nav-drawer"
    >
      <q-list class="q-mt-lg">
        <q-item-label header class="text-uppercase q-mb-md text-weight-bolder text-wcag-caption" style="font-size: 0.7rem; letter-spacing: 2px;">
          {{ $t('layout.menu') }}
        </q-item-label>

        <q-item
          v-for="link in navLinks"
          :key="link.titleKey"
          clickable
          v-ripple
          :to="link.link"
          exact
          active-class="active-nav-item"
          class="q-mb-sm rounded-borders q-mx-md nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" size="24px" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bolder">{{ $t(link.titleKey) }}</q-item-label>
            <q-item-label caption class="text-wcag-caption text-weight-medium">{{ $t(link.captionKey) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
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

const navLinks = [
  {
    titleKey: 'nav.dashboard',
    captionKey: 'nav.dashboardCaption',
    icon: 'mdi-view-dashboard',
    link: '/',
  },
  {
    titleKey: 'nav.projects',
    captionKey: 'nav.projectsCaption',
    icon: 'mdi-code-braces',
    link: '/projects',
  },
  {
    titleKey: 'nav.bookmarks',
    captionKey: 'nav.bookmarksCaption',
    icon: 'mdi-bookmark-multiple',
    link: '/bookmarks',
  },
  {
    titleKey: 'nav.settings',
    captionKey: 'nav.settingsCaption',
    icon: 'mdi-cog',
    link: '/settings',
  },
]

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style lang="sass">
.nav-item
  color: var(--dd-text-secondary)
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)
  &:hover
    color: var(--dd-primary)
    background: var(--dd-primary-glow)

.active-nav-item
  color: var(--dd-primary) !important
  background: var(--dd-primary-glow) !important
  border-right: 4px solid var(--dd-primary)
  border-top-right-radius: 0
  border-bottom-right-radius: 0

.nav-drawer
  border-right: 1px solid var(--dd-border)

.q-header
  background: var(--dd-card-bg) !important
  backdrop-filter: blur(12px)
</style>
