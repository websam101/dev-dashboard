<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-xl">
      <div>
        <div class="text-h4 text-weight-bold q-mb-xs text-grey-3">Resources</div>
        <div class="text-grey-6">Organize your docs, tools, and project links</div>
      </div>
      <q-space />
      <q-btn color="primary" unelevated icon="add" label="New Bookmark" @click="showAddDialog = true" class="q-px-md" />
    </div>

    <div v-if="bookmarksStore.loading" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="3em" />
    </div>

    <div v-else-if="bookmarksStore.categories.length === 0" class="text-center q-pa-xl">
      <q-card bordered flat class="bg-grey-9 q-pa-xl dashed-border">
        <q-icon name="bookmark_border" size="64px" color="grey-8" />
        <div class="text-h6 text-grey-6 q-mt-md">Your library is empty</div>
        <q-btn color="primary" outline label="Add your first bookmark" @click="showAddDialog = true" class="q-mt-md" />
      </q-card>
    </div>

    <div v-else class="row q-col-gutter-xl">
      <!-- Card per Category -->
      <div v-for="category in bookmarksStore.categories" :key="category" class="col-12 col-sm-6 col-md-4">
        <q-card bordered flat class="bookmark-category-card bg-grey-9">
          <q-card-section class="bg-grey-10 text-grey-3 q-py-md border-bottom">
            <div class="row items-center no-wrap">
              <q-icon name="folder_special" color="primary" size="20px" class="q-mr-sm" />
              <div class="text-subtitle1 text-weight-bold">{{ category }}</div>
              <q-space />
              <q-badge color="primary" outline class="text-weight-bold">{{ bookmarksStore.byCategory(category).length }}</q-badge>
            </div>
          </q-card-section>
          
          <q-list padding class="q-py-xs">
            <q-item v-for="link in bookmarksStore.byCategory(category)" :key="link.id" class="q-mb-xs">
              <q-item-section avatar @click="openLink(link.url)" class="cursor-pointer">
                <q-avatar rounded size="32px" color="grey-10">
                  <FaviconRenderer :url="link.url" />
                </q-avatar>
              </q-item-section>
              
              <q-item-section @click="openLink(link.url)" class="cursor-pointer">
                <q-item-label class="text-weight-medium text-grey-3">{{ link.title }}</q-item-label>
                <q-item-label caption class="ellipsis text-grey-6">{{ link.url }}</q-item-label>
              </q-item-section>
              
              <q-item-section side>
                <q-btn flat round dense icon="delete_outline" color="grey-7" size="sm" @click="removeBookmark(link.id)">
                  <q-tooltip>Remove</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <!-- Add Bookmark Dialog -->
    <q-dialog v-model="showAddDialog" backdrop-filter="blur(4px)">
      <q-card class="bg-grey-10 text-white" style="min-width: 450px">
        <q-card-section>
          <div class="text-h6">New Resource</div>
        </q-card-section>
        
        <q-card-section class="q-gutter-md">
          <q-input v-model="newBookmark.title" label="Title" dark filled color="primary" />
          <q-input v-model="newBookmark.url" label="URL" dark filled color="primary" placeholder="https://..." />
          <q-input v-model="newBookmark.category" label="Category" dark filled color="primary" hint="e.g. AI, Docs, Clients" />
          <q-input v-model="newBookmark.description" label="Notes" dark filled color="primary" type="textarea" />
        </q-card-section>
        
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="grey-5" v-close-popup />
          <q-btn unelevated label="Save Bookmark" color="primary" @click="saveBookmark" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { api } from '../../boot/axios';
import FaviconRenderer from '../../components/FaviconRenderer.vue';

const bookmarksStore = useBookmarksStore();
const showAddDialog = ref(false);

const newBookmark = ref({
  title: '',
  url: '',
  category: 'General',
  description: ''
});

const saveBookmark = async () => {
  if (!newBookmark.value.title || !newBookmark.value.url) return;
  await bookmarksStore.addBookmark(newBookmark.value);
  newBookmark.value = { title: '', url: '', category: 'General', description: '' };
};

const removeBookmark = async (id: string) => {
  await api.post('/api/bookmarks/remove', { id });
  await bookmarksStore.loadBookmarks();
};

const openLink = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
};

onMounted(() => {
  void bookmarksStore.loadBookmarks();
});
</script>

<style lang="sass" scoped>
.bookmark-category-card
  height: 100%
  border-radius: 12px
  transition: transform 0.2s ease, box-shadow 0.2s ease
  &:hover
    transform: translateY(-4px)
    box-shadow: 0 8px 24px rgba(0,0,0,0.4)

.border-bottom
  border-bottom: 1px solid rgba(255,255,255,0.05)

.dashed-border
  border: 2px dashed rgba(255,255,255,0.1)
  border-radius: 16px
</style>
