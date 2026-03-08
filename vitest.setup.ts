import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Quasar wrappers
vi.mock('#q-app/wrappers', () => ({
  defineBoot: (fn: any) => fn,
  defineSsrMiddleware: (fn: any) => fn,
  defineConfig: (fn: any) => fn
}))

// Fully mock IndexedDB for 'idb' library and stores
if (typeof window !== 'undefined') {
  const mockIDBRequest = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      close: vi.fn(),
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          getAll: vi.fn().mockReturnThis(),
          put: vi.fn().mockReturnThis(),
          delete: vi.fn().mockReturnThis(),
          oncomplete: null,
          onerror: null
        }),
        oncomplete: null,
        onerror: null,
        onabort: null
      }),
      createObjectStore: vi.fn(),
      objectStoreNames: { contains: vi.fn().mockReturnValue(true) }
    }
  };

  (window as any).indexedDB = {
    open: vi.fn().mockReturnValue(mockIDBRequest),
    deleteDatabase: vi.fn().mockReturnValue(mockIDBRequest)
  };
  (window as any).IDBRequest = class {};
  (window as any).IDBTransaction = class {};
  (window as any).IDBDatabase = class {};
  (window as any).IDBObjectStore = class {};
  (window as any).IDBIndex = class {};
  (window as any).IDBCursor = class {};
  (window as any).IDBKeyRange = class {};
}

// Mock Quasar internals
const mockQuasar = {
  notify: vi.fn(),
  dialog: () => ({
    onOk: (fn: any) => { fn(); return { onCancel: (f: any) => { f(); return { onDismiss: (d: any) => d() } } } },
    onCancel: (fn: any) => { fn(); return { onDismiss: (d: any) => d() } },
    onDismiss: (fn: any) => fn()
  }),
  loading: {
    show: vi.fn(),
    hide: vi.fn()
  },
  dark: {
    set: vi.fn(),
    isActive: false
  },
  screen: {
    gt: { xs: true, sm: true, md: true, lg: true, xl: true },
    lt: { xs: false, sm: false, md: false, lg: false, xl: false },
    xs: false, sm: false, md: true, lg: false, xl: false
  }
}

export const Dark = {
  set: vi.fn(),
  isActive: false
}

export const debounce = (fn: any) => fn;

vi.mock('quasar', () => ({
  useQuasar: () => mockQuasar,
  defineBoot: (fn: any) => fn,
  Dark: {
    set: vi.fn(),
    isActive: false
  },
  debounce: (fn: any) => fn,
  exportFile: vi.fn().mockReturnValue(true)
}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'en-US' }
  })
}))

// Configure Vue Test Utils globally
config.global.mocks = {
  $t: (key: string) => key,
  $q: mockQuasar
}

// Mock directives
config.global.directives = {
  ripple: {},
  'close-popup': {}
}

// Improve component stubs to handle props and avoid Vue warnings
const BaseStub = { template: '<div><slot /></div>' };
const TableStub = { 
  props: ['rows', 'columns', 'rowKey', 'filter', 'pagination'],
  template: '<div class="q-table-stub"><slot name="top" /><slot /><slot name="bottom" /></div>' 
};

config.global.stubs = {
  'q-page': BaseStub,
  'q-layout': BaseStub,
  'q-header': BaseStub,
  'q-drawer': BaseStub,
  'q-page-container': BaseStub,
  'q-toolbar': BaseStub,
  'q-toolbar-title': BaseStub,
  'q-btn': { 
    props: ['label', 'icon', 'color', 'flat', 'round', 'dense', 'size', 'unelevated', 'outline', 'loading', 'disable'],
    template: '<button @click="$emit(\'click\')"><slot />{{label}}</button>' 
  },
  'q-icon': { props: ['name', 'size', 'color'], template: '<i><slot /></i>' },
  'q-avatar': BaseStub,
  'q-badge': BaseStub,
  'q-card': BaseStub,
  'q-card-section': BaseStub,
  'q-card-actions': BaseStub,
  'q-list': BaseStub,
  'q-item': BaseStub,
  'q-item-section': BaseStub,
  'q-item-label': BaseStub,
  'q-toggle': { props: ['modelValue'], template: '<input type="checkbox" :checked="modelValue" />' },
  'q-select': { props: ['modelValue', 'options'], template: '<div class="q-select-stub">{{modelValue}}</div>' },
  'q-input': { props: ['modelValue'], template: '<input :value="modelValue" />' },
  'q-tabs': BaseStub,
  'q-tab': BaseStub,
  'q-separator': { template: '<hr />' },
  'q-tooltip': BaseStub,
  'q-checkbox': { props: ['modelValue'], template: '<input type="checkbox" :checked="modelValue" />' },
  'q-table': TableStub,
  'q-td': { props: ['props'], template: '<td><slot /></td>' },
  'q-th': { props: ['props'], template: '<th><slot /></th>' },
  'q-tr': { props: ['props'], template: '<tr><slot /></tr>' },
  'q-spinner-dots': BaseStub,
  'q-spinner-grid': BaseStub,
  'q-btn-group': BaseStub,
  'q-slide-transition': BaseStub,
  'q-menu': BaseStub,
  'q-dialog': BaseStub,
  'q-space': { template: '<div class="q-space" style="flex-grow: 1" />' },
  'q-img': { props: ['src'], template: '<img :src="src" />' },
  'q-chip': { props: ['label', 'icon', 'color', 'outline', 'clickable', 'dense', 'size'], template: '<div class="q-chip-stub"><slot />{{label}}</div>' }
}
