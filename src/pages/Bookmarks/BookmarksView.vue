<template>
  <q-page class="q-pa-md">
    <!-- Collection Filter Row (Top Level Hierarchy) -->
    <div class="row items-center q-mb-md q-gutter-x-sm">
      <div class="header-accent-line q-mr-sm" style="height: 24px"></div>
      <div class="text-overline text-wcag-bold opacity-70 q-mr-sm" style="font-size: 0.6rem">COLLECTIONS</div>
      <q-tabs
        v-model="activeCollection"
        dense
        no-caps
        inline-label
        class="tabs-container-modern col scroll"
        active-color="primary"
        indicator-color="primary"
        align="left"
        outside-arrows
        mobile-arrows
      >
        <q-tab name="all" icon="apps" :label="$t('bookmarks.allResources')" class="text-weight-bold">
          <q-tooltip>{{ $t('bookmarks.allResourcesHint') }}</q-tooltip>
        </q-tab>
        <q-tab
          v-for="col in sortedCollections"
          :key="col.id"
          :name="col.id"
          :label="col.name"
          class="text-weight-bold"
        />
        <q-tab name="unassigned" icon="question_mark" :label="$t('bookmarks.unassigned')" class="text-weight-bold">
          <q-tooltip>{{ $t('bookmarks.unassignedHint') }}</q-tooltip>
        </q-tab>
      </q-tabs>
      
      <q-btn 
        outline
        color="primary" 
        icon="settings" 
        @click="showManageCollections = true" 
        size="sm" 
        class="rounded-borders"
        :aria-label="$t('bookmarks.manageCollections')"
      >
        <q-tooltip>{{ $t('bookmarks.manageCollections') }}</q-tooltip>
      </q-btn>
    </div>

    <!-- Main Header (Secondary Actions & Context) -->
    <div class="row items-center justify-between q-mb-md q-pa-sm rounded-borders bg-glass shadow-1">
      <div class="row items-center">
        <div>
          <h1 class="text-h5 text-wcag-bold q-ma-none line-height-1">{{ $t('bookmarks.title') }}</h1>
          <div class="text-wcag-caption opacity-70 text-weight-medium">
            <template v-if="filteredBookmarks.length < bookmarksStore.bookmarks.length">
              {{ filteredBookmarks.length }} {{ $t('common.of') }} {{ bookmarksStore.bookmarks.length }} {{ $t('dashboard.savedBookmarks').toLowerCase() }}
            </template>
            <template v-else>
              {{ bookmarksStore.bookmarks.length }} {{ $t('dashboard.savedBookmarks').toLowerCase() }}
            </template>
          </div>
        </div>
      </div>
      
      <div class="row q-gutter-x-md items-center">
        <!-- Search & Context Group -->
        <div class="row no-wrap shadow-1 rounded-borders overflow-hidden border-subtle">
          <q-input
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            dense
            borderless
            class="bg-input-header q-px-sm"
            style="width: 200px"
            clearable
            @clear="searchQuery = ''"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="xs" color="primary" />
            </template>
          </q-input>
          
          <q-separator vertical inset />

          <q-select
            v-model="selectedProject"
            :options="projectOptions"
            borderless
            dense
            options-dense
            emit-value
            map-options
            style="width: 160px"
            class="bg-input-header q-px-sm font-wcag-bold"
          >
            <template v-slot:prepend>
              <q-icon name="work" color="primary" size="xs" />
            </template>
          </q-select>

        </div>

        <div class="row q-gutter-x-sm">
          <q-btn-group unelevated class="shadow-1 rounded-borders overflow-hidden">
            <q-btn flat dense icon="download" color="primary" @click="exportData" size="sm" :aria-label="$t('bookmarks.exportHint')">
              <q-tooltip>{{ $t('bookmarks.exportHint') }}</q-tooltip>
            </q-btn>
            <q-btn flat dense icon="upload" color="primary" @click="triggerImport" size="sm" :aria-label="$t('bookmarks.importHint')">
              <q-tooltip>{{ $t('bookmarks.importHint') }}</q-tooltip>
            </q-btn>
          </q-btn-group>

          <q-btn color="primary" unelevated icon="add" :label="$q.screen.gt.sm ? $t('bookmarks.newBookmark') : ''" @click="openAddDialog" size="sm" class="text-weight-bolder shadow-1">
            <q-tooltip>{{ $t('bookmarks.newBookmarkHint') }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Restored Compact Favorites Bar (Context-Aware & Filtered) -->
    <div v-if="filteredFavorites.length > 0" class="row items-center q-mb-md q-pa-xs rounded-borders border-primary-light fav-bar shadow-1">
      <div class="text-overline text-wcag-bold q-mx-md opacity-70" style="font-size: 0.6rem">PINNED</div>
      <div class="row no-wrap q-gutter-x-xs scroll hide-scrollbar overflow-hidden">
        <q-chip
          v-for="(fav, index) in filteredFavorites"
          :key="fav.id"
          clickable
          @click="openLink(fav.url)"
          outline
          color="primary"
          :class="'tag-bg-' + ((index % 6) + 1)"
          class="q-ma-none text-weight-bolder shadow-1 hover-scale"
          dense
          style="font-size: 0.75rem"
        >
          <q-avatar rounded size="16px">
            <FaviconRenderer :url="fav.url" />
          </q-avatar>
          <div class="ellipsis" style="max-width: 120px">{{ fav.title }}</div>
          <q-tooltip>{{ fav.url }}</q-tooltip>
        </q-chip>
      </div>
    </div>

    <!-- Batch Actions Bar -->
    <q-slide-transition>
      <div v-if="selectedRows.length > 0" class="q-mb-sm q-pa-xs rounded-borders bg-gradient-primary text-white row items-center shadow-2">
        <div class="text-weight-bolder q-mx-md">{{ selectedRows.length }} Selected</div>
        <q-space />
        <q-btn flat dense icon="delete" :label="$t('common.delete')" class="text-weight-bold" @click="confirmDeleteMultiple">
          <q-tooltip>{{ $t('bookmarks.deleteSelectedHint') }}</q-tooltip>
        </q-btn>
        <q-btn flat round dense icon="close" @click="selectedRows = []" class="q-ml-sm" :aria-label="$t('common.cancel')">
          <q-tooltip>{{ $t('common.cancel') }}</q-tooltip>
        </q-btn>
      </div>
    </q-slide-transition>

    <input type="file" ref="fileInput" style="display: none" accept=".json" @change="handleFileImport" />

    <!-- High Density Bookmarks Table with Selection & Native Sorting -->
    <q-table
      :rows="filteredBookmarks"
      :columns="columns"
      row-key="id"
      dense
      flat
      bordered
      v-model:pagination="pagination"
      hide-pagination
      selection="multiple"
      v-model:selected="selectedRows"
      class="compact-table rounded-borders shadow-1"
    >
      <!-- Header Cell Override for Right-Click Reset -->
      <template v-slot:header-cell="props">
        <q-th :props="props" @contextmenu.prevent="resetSort" class="cursor-pointer">
          {{ props.col.label }}
          <q-tooltip>{{ $t('bookmarks.sortResetHint') }}</q-tooltip>
        </q-th>
      </template>

      <!-- Header Selection Override -->
      <template v-slot:header-selection="scope">
        <q-checkbox v-model="scope.selected" dense :aria-label="$t('common.selectAll')" />
      </template>

      <!-- Body Selection Override -->
      <template v-slot:body-selection="scope">
        <q-checkbox v-model="scope.selected" dense :aria-label="$t('common.selectItem')" />
      </template>

      <!-- RESOURCE Column (Icon, Fav, Title) -->
      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              dense
              :icon="props.row.favorite ? 'star' : 'star_border'"
              :color="props.row.favorite ? 'amber-10' : 'grey-5'"
              size="sm"
              class="q-mr-xs"
              @click="bookmarksStore.toggleFavorite(props.row.id)"
            >
              <q-tooltip>{{ props.row.favorite ? $t('bookmarks.unpinHint') : $t('bookmarks.pinHint') }}</q-tooltip>
            </q-btn>
            <q-avatar rounded size="20px" class="q-mr-sm shadow-1">
              <FaviconRenderer :url="props.row.url" />
            </q-avatar>
            <div class="text-weight-bold text-wcag ellipsis cursor-pointer" @click="openViewDialog(props.row)">
              <span v-html="highlight(props.row.title)" />
              <q-tooltip>{{ $t('bookmarks.viewDetails') }}</q-tooltip>
            </div>
          </div>
        </q-td>
      </template>

      <!-- URL Column -->
      <template v-slot:body-cell-url="props">
        <q-td :props="props">
          <div class="text-primary text-weight-bold ellipsis cursor-pointer hover-underline" @click="openLink(props.row.url)" style="max-width: 300px">
            <span v-html="highlight(props.row.url)" />
            <q-tooltip>{{ $t('bookmarks.openLinkHint') }}</q-tooltip>
          </div>
        </q-td>
      </template>

      <!-- Tags Column -->
      <template v-slot:body-cell-tags="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <div class="row q-gutter-xs col">
              <q-badge v-for="(tag, idx) in (props.row.tags as string[])" :key="tag" :class="'tag-bg-' + ((Number(idx) % 6) + 1)" class="text-weight-bold" style="font-size: 0.65rem">
                <span v-html="highlight(tag)" />
              </q-badge>
            </div>
            <!-- Project Assignment Counter -->
            <div v-if="props.row.projectIds?.length" class="q-ml-sm">
              <q-badge color="accent" outline class="text-weight-bolder" style="font-size: 0.65rem">
                <q-icon name="work" size="10px" class="q-mr-xs" />
                {{ props.row.projectIds.length }}
                <q-tooltip>
                  {{ $t('bookmarks.assignedToProjects', { count: props.row.projectIds.length }) }}
                </q-tooltip>
              </q-badge>
            </div>
          </div>
        </q-td>
      </template>

      <!-- Actions Column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <div class="row items-center justify-end q-gutter-x-xs">
            <q-btn flat round dense icon="visibility" size="sm" color="primary" @click="openViewDialog(props.row)" :aria-label="$t('bookmarks.viewDetails')">
              <q-tooltip>{{ $t('bookmarks.viewDetails') }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="edit" size="sm" color="secondary" @click="openEditDialog(props.row)" :aria-label="$t('common.edit')">
              <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete_outline" size="sm" color="negative" @click="confirmRemove(props.row)" :aria-label="$t('common.remove')">
              <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <!-- Manage Collections Dialog -->
    <q-dialog v-model="showManageCollections" backdrop-filter="blur(4px)">
      <q-card style="min-width: 400px" class="bg-dialog">
        <q-card-section class="row items-center q-py-sm border-bottom bg-dialog-header">
          <div class="text-subtitle1 text-weight-bolder">{{ $t('bookmarks.manageCollections') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup size="sm" :aria-label="$t('common.close')">
            <q-tooltip>{{ $t('common.close') }}</q-tooltip>
          </q-btn>
        </q-card-section>
        <q-card-section class="q-pa-md">
          <div class="row q-gutter-sm q-mb-md">
            <q-input v-model="newCollectionName" :label="$t('bookmarks.newCollection')" dense outlined class="col" @keyup.enter="addCollection" />
            <q-btn color="primary" icon="add" @click="addCollection" :disable="!newCollectionName" size="sm" :aria-label="$t('bookmarks.addCollectionHint')">
              <q-tooltip>{{ $t('bookmarks.addCollectionHint') }}</q-tooltip>
            </q-btn>
          </div>
          <q-list bordered separator>
            <q-item v-for="col in sortedCollections" :key="col.id" dense>
              <q-item-section v-if="editingCollectionId === col.id">
                <q-input v-model="editingName" dense outlined @keyup.enter="saveRenamedCollection" @keyup.esc="editingCollectionId = null" autofocus />
              </q-item-section>
              <q-item-section v-else class="text-weight-bold">{{ col.name }}</q-item-section>
              <q-item-section side>
                <div class="row q-gutter-x-xs">
                  <q-btn flat round dense :icon="editingCollectionId === col.id ? 'check' : 'edit'" :color="editingCollectionId === col.id ? 'positive' : 'primary'" size="sm" @click="editingCollectionId === col.id ? saveRenamedCollection() : startRenaming(col)" :aria-label="editingCollectionId === col.id ? $t('common.save') : $t('common.edit')">
                    <q-tooltip>{{ editingCollectionId === col.id ? $t('common.save') : $t('common.edit') }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round dense icon="delete" color="negative" size="sm" @click="confirmDeleteCollection(col)" :aria-label="$t('common.remove')">
                    <q-tooltip>{{ $t('common.remove') }}</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- View Details Dialog -->
    <q-dialog v-model="showViewDialog" backdrop-filter="blur(8px)">
      <q-card style="min-width: 500px" class="bg-dialog">
        <q-card-section class="row items-start q-pa-md border-bottom bg-dialog-header">
          <q-avatar rounded size="40px" class="q-mr-md shadow-1">
            <FaviconRenderer :url="viewingBookmark?.url || ''" />
          </q-avatar>
          <div class="col">
            <div class="text-h6 text-wcag-bold">{{ viewingBookmark?.title }}</div>
            <div class="text-caption text-primary text-weight-bolder cursor-pointer hover-underline" @click="openLink(viewingBookmark?.url || '')">
              {{ viewingBookmark?.url }}
            </div>
          </div>
          <q-btn icon="close" flat round dense v-close-popup size="sm" :aria-label="$t('common.close')">
            <q-tooltip>{{ $t('common.close') }}</q-tooltip>
          </q-btn>
        </q-card-section>
        <q-card-section class="q-pa-md">
          <div class="bg-dialog-content q-pa-sm rounded-borders text-wcag" style="white-space: pre-wrap">
            <FormattedText :text="viewingBookmark?.description || ''" />
          </div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-sm border-top">
          <q-btn flat :label="$t('common.edit')" color="primary" size="sm" @click="switchToEditFromView">
            <q-tooltip>{{ $t('common.edit') }}</q-tooltip>
          </q-btn>
          <q-btn unelevated :label="$t('common.ok')" color="primary" size="sm" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="showDialog" backdrop-filter="blur(4px)">
      <q-card style="min-width: 500px" class="bg-dialog">
        <q-card-section class="q-py-sm border-bottom bg-dialog-header">
          <div class="text-subtitle1 text-weight-bolder">{{ isEditing ? $t('bookmarks.editResource') : $t('bookmarks.newResource') }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm q-pt-md">
          <q-input 
            v-model="editingBookmark.url" 
            label="URL" 
            dense 
            filled 
            @keyup.enter="fetchMetadata"
            @blur="autoFetch"
          >
            <template v-slot:append>
              <q-btn 
                flat 
                round 
                dense 
                icon="mdi-arrow-right-bold-circle-outline" 
                color="primary" 
                @click="fetchMetadata"
                :loading="isFetchingMetadata"
              >
                <q-tooltip>{{ $t('bookmarks.fetchMetadata') }}</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <q-input v-model="editingBookmark.title" label="Title" dense filled :loading="isFetchingMetadata" />
          <div class="row q-col-gutter-xs">
            <q-select v-model="editingBookmark.collectionId" :options="collectionOptions" label="Collection" dense filled emit-value map-options class="col-6" />
            <q-select v-model="editingBookmark.projectIds" :options="projectOptions" label="Projects" dense filled multiple use-chips emit-value map-options class="col-6" />
          </div>
          <q-select v-model="editingBookmark.tags" label="Tags" dense filled use-input use-chips multiple new-value-mode="add-unique" :options="tagOptions" @filter="filterTags" />
          <q-input v-model="editingBookmark.description" label="Description" dense filled type="textarea" />
        </q-card-section>
        <q-card-actions align="right" class="q-pb-md q-px-md border-top">
          <q-btn flat :label="$t('common.cancel')" color="primary" v-close-popup size="sm" />
          <q-btn color="primary" :label="$t('common.save')" unelevated @click="saveBookmark" size="sm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useBookmarksStore } from '../../stores/bookmarksStore';
import { useProjectsStore } from '../../stores/projectsStore';
import { useI18n } from 'vue-i18n';
import FaviconRenderer from '../../components/FaviconRenderer.vue';
import FormattedText from '../../components/FormattedText.vue';
import type { Bookmark } from '../../services/db/types';
import { api } from '../../boot/api';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const { t } = useI18n();
const bookmarksStore = useBookmarksStore();
const projectsStore = useProjectsStore();

const showDialog = ref(false);
const showViewDialog = ref(false);
const showManageCollections = ref(false);
const isEditing = ref(false);
const selectedProject = ref('global');
const activeCollection = ref('all');
const searchQuery = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const newCollectionName = ref('');
const pagination = ref({
  sortBy: null,
  descending: false,
  rowsPerPage: 0
});
const editingCollectionId = ref<string | null>(null);
const editingName = ref('');
const viewingBookmark = ref<Bookmark | null>(null);
const selectedRows = ref<Bookmark[]>([]);
const isFetchingMetadata = ref(false);

const columns: any[] = [
  { name: 'title', label: t('bookmarks.colResource'), align: 'left', sortable: true, field: 'title' },
  { name: 'url', label: t('bookmarks.colUrl'), align: 'left', sortable: true, field: 'url' },
  { name: 'tags', label: t('bookmarks.colTags'), align: 'left' },
  { name: 'actions', label: t('common.actions'), align: 'right' }
];

const editingBookmark = ref<Omit<Bookmark, 'id' | 'createdAt'> & { id?: string; createdAt?: string }>({
  title: '', url: '', tags: [], description: '', favorite: false, projectIds: ['global'], collectionId: undefined
});

const searchPlaceholder = computed(() => t('bookmarks.noMatches', { query: '' }).replace(' ""', '...'));

const projectOptions = computed(() => [{ label: t('bookmarks.globalContext'), value: 'global' }, ...projectsStore.projects.map(p => ({ label: p.name, value: p.id }))]);
const collectionOptions = computed(() => [{ label: t('bookmarks.unassigned'), value: undefined }, ...bookmarksStore.collections.map((c: any) => ({ label: c.name, value: c.id }))]);
const sortedCollections = computed(() => [...bookmarksStore.collections].sort((a, b) => a.name.localeCompare(b.name)));

const filteredFavorites = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim();
  let list = bookmarksStore.favorites;
  if (activeCollection.value !== 'all') {
    if (activeCollection.value === 'unassigned') list = list.filter(b => !b.collectionId);
    else list = list.filter(b => b.collectionId === activeCollection.value);
  }
  if (selectedProject.value !== 'global') {
    list = list.filter(b => b.projectIds?.includes(selectedProject.value));
  }
  if (query) {
    list = list.filter(b => b.title.toLowerCase().includes(query) || b.url.toLowerCase().includes(query) || b.tags.some(t => t.toLowerCase().includes(query)));
  }
  return list;
});

const filteredBookmarks = computed(() => {
  const query = (searchQuery.value || '').toLowerCase().trim();
  let base = [...bookmarksStore.byCollection(activeCollection.value)];
  if (selectedProject.value !== 'global') {
    base = base.filter(b => b.projectIds?.includes(selectedProject.value));
  }
  if (query) base = base.filter(b => b.title.toLowerCase().includes(query) || b.url.toLowerCase().includes(query) || b.tags.some(t => t.toLowerCase().includes(query)));
  
  // Default sort is newest to oldest if no table sort is active
  if (!pagination.value.sortBy) {
    return base.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }
  return base;
});

const highlight = (text: string) => {
  const query = (searchQuery.value || '').toLowerCase().trim();
  if (!query || !text) return text;
  return text.replace(new RegExp(`(${query})`, 'gi'), '<mark class="highlight-text">$1</mark>');
};

const resetSort = () => {
  pagination.value.sortBy = null;
  pagination.value.descending = false;
};

const openLink = (url: string) => { if (typeof window !== 'undefined') window.open(url, '_blank'); };
const openViewDialog = (b: Bookmark) => { viewingBookmark.value = b; showViewDialog.value = true; };
const openEditDialog = (b: Bookmark) => { isEditing.value = true; editingBookmark.value = { ...b }; showDialog.value = true; };
const openAddDialog = () => { isEditing.value = false; editingBookmark.value = { title: '', url: '', tags: [], description: '', favorite: false, projectIds: [selectedProject.value], collectionId: activeCollection.value !== 'all' ? activeCollection.value : undefined }; showDialog.value = true; };

const saveBookmark = async () => {
  if (isEditing.value && editingBookmark.value.id) await bookmarksStore.updateBookmark(editingBookmark.value as Bookmark);
  else await bookmarksStore.addBookmark(editingBookmark.value as any);
  showDialog.value = false;
};

const confirmRemove = (b: Bookmark) => { $q.dialog({ title: t('common.remove'), message: t('bookmarks.removeConfirm', { title: b.title }), cancel: true, dark: true }).onOk(() => { void bookmarksStore.deleteBookmark(b.id); }); };
const confirmDeleteMultiple = () => { $q.dialog({ title: t('common.confirmDelete'), message: t('bookmarks.deleteSelectedConfirm', { count: selectedRows.value.length }), cancel: true, dark: true }).onOk(() => { void (async () => { for (const b of selectedRows.value) await bookmarksStore.deleteBookmark(b.id); selectedRows.value = []; })(); }); };

const tagOptions = ref<string[]>([]);
const filterTags = (val: string, update: any) => update(() => { tagOptions.value = val === '' ? bookmarksStore.allTags : bookmarksStore.allTags.filter(v => v.toLowerCase().includes(val.toLowerCase())); });

const startRenaming = (col: any) => { editingCollectionId.value = col.id; editingName.value = col.name; };
const saveRenamedCollection = async () => { if (editingCollectionId.value) await bookmarksStore.updateCollection({ id: editingCollectionId.value, name: editingName.value }); editingCollectionId.value = null; };
const addCollection = async () => { if (newCollectionName.value) await bookmarksStore.addCollection(newCollectionName.value); newCollectionName.value = ''; };
const confirmDeleteCollection = (col: any) => { $q.dialog({ title: t('common.delete'), message: t('bookmarks.removeCollectionConfirm', { name: col.name }), cancel: true, dark: true }).onOk(() => { void (async () => { await bookmarksStore.deleteCollection(col.id); if (activeCollection.value === col.id) activeCollection.value = 'all'; })(); }); };

const fetchMetadata = async () => {
  if (!editingBookmark.value.url || !editingBookmark.value.url.startsWith('http')) return;
  
  isFetchingMetadata.value = true;
  try {
    const res = await api.post('/api/utils/fetch-metadata', { url: editingBookmark.value.url });
    if (res?.data.title) editingBookmark.value.title = res.data.title;
    if (res?.data.description) editingBookmark.value.description = res.data.description;
  } catch (e) {
    console.error('Metadata fetch failed', e);
  } finally {
    isFetchingMetadata.value = false;
  }
};

const autoFetch = () => {
  if (!isEditing.value && editingBookmark.value.url && !editingBookmark.value.title) {
    void fetchMetadata();
  }
};

const exportData = () => {
  const data = JSON.stringify({ bookmarks: bookmarksStore.bookmarks, collections: bookmarksStore.collections }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `bookmarks-export-${new Date().toISOString().split('T')[0]}.json`; a.click();
  URL.revokeObjectURL(url);
};

const triggerImport = () => fileInput.value?.click();
const handleFileImport = (e: any) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event: any) => {
    void (async () => {
      try {
        const imported = JSON.parse(event.target.result);
        const bookmarks = Array.isArray(imported) ? imported : (imported.bookmarks || []);
        const collections = Array.isArray(imported) ? [] : (imported.collections || []);
        
        await bookmarksStore.importSnapshot({ bookmarks, collections });
        $q.notify({ message: t('common.importSuccess'), color: 'positive' });
      } catch { $q.notify({ message: t('common.importFailed'), color: 'negative' }); }
    })();
  };
  reader.readAsText(file);
};

const switchToEditFromView = () => { if (viewingBookmark.value) { openEditDialog(viewingBookmark.value); showViewDialog.value = false; } };

onMounted(() => {
  void bookmarksStore.loadBookmarks();
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

.fav-bar
  background: var(--dd-card-bg)
  border: 1px solid var(--dd-border)
  border-left: 6px solid var(--dd-primary)

.tabs-container
  background: rgba(var(--dd-primary), 0.05)
  border: 1px solid var(--dd-border)

.hide-scrollbar
  scrollbar-width: none
  &::-webkit-scrollbar
    display: none

.border-primary-light
  border: 1px solid var(--dd-primary-glow)

.hover-scale
  transition: transform 0.2s ease
  &:hover
    transform: scale(1.05)

.bg-dialog
  background: var(--dd-card-bg) !important
  color: var(--dd-text-primary)

.bg-dialog-header
  background: rgba(var(--dd-primary), 0.05)
  .body--dark &
    background: rgba(255, 255, 255, 0.03)

.bg-dialog-content
  background: rgba(0, 0, 0, 0.03)
  .body--dark &
    background: rgba(255, 255, 255, 0.05)

.bg-glass
  background: rgba(var(--dd-bg-rgb), 0.6)
  backdrop-filter: blur(10px)
  border: 1px solid rgba(255, 255, 255, 0.05)

.header-accent-line
  width: 4px
  height: 32px
  background: var(--q-primary)
  border-radius: 4px

.border-subtle
  border: 1px solid rgba(255, 255, 255, 0.1)

.bg-input-header
  background: rgba(0, 0, 0, 0.1)
  transition: background 0.3s ease
  &:hover
    background: rgba(0, 0, 0, 0.2)

.tabs-container-modern
  :deep(.q-tab__label)
    font-size: 0.75rem
    letter-spacing: 0.5px
</style>
