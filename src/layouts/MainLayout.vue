<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-10 text-white">
    <q-header class="bg-grey-10" bordered>
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="primary"
        />

        <q-toolbar-title class="text-weight-bold row items-center">
          <q-icon name="terminal" class="q-mr-sm" color="primary" size="28px" />
          DevDashboard
        </q-toolbar-title>

        <q-btn flat round dense icon="notifications" color="grey-5">
          <q-badge color="red" floating rounded dot v-if="notifications.length > 0" />
          <q-menu dark class="bg-grey-10 border-white">
            <q-list style="min-width: 300px">
              <q-item-label header class="text-grey-5">Recent Activity</q-item-label>
              <q-item v-for="notif in notifications" :key="notif.id">
                <q-item-section avatar>
                  <q-icon :name="notif.icon" :color="notif.color" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ notif.message }}</q-item-label>
                  <q-item-label caption class="text-grey-6">{{ notif.time }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="notifications.length === 0" class="text-center q-pa-md">
                <q-item-section class="text-grey-7 italic">No new notifications</q-item-section>
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
      class="bg-grey-10"
      :width="260"
    >
      <q-list class="q-mt-md">
        <q-item-label header class="text-grey-6 text-uppercase q-mb-sm text-weight-bold" style="font-size: 0.75rem; letter-spacing: 1px;">
          Menu
        </q-item-label>

        <q-item
          v-for="link in navLinks"
          :key="link.title"
          clickable
          v-ripple
          :to="link.link"
          exact
          active-class="text-primary bg-grey-9"
          class="q-mb-xs rounded-borders q-mx-sm"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-medium">{{ link.title }}</q-item-label>
            <q-item-label caption class="text-grey-6">{{ link.caption }}</q-item-label>
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

const navLinks = [
  {
    title: 'Dashboard',
    caption: 'System Overview',
    icon: 'dashboard',
    link: '/',
  },
  {
    title: 'Projects',
    caption: 'Dev Lab & Git Hub',
    icon: 'code',
    link: '/projects',
  },
  {
    title: 'Bookmarks',
    caption: 'Resource Manager',
    icon: 'bookmark',
    link: '/bookmarks',
  },
  {
    title: 'Settings',
    caption: 'Lab Configuration',
    icon: 'settings',
    link: '/settings',
  },
]

const leftDrawerOpen = ref(false);
const notifications = ref([
  { id: 1, message: 'System Monitor initialized', time: 'Just now', icon: 'check_circle', color: 'positive' }
]);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>

<style lang="sass">
body
  background: #121212
  color: #fff
</style>
