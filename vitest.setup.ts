import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock Quasar wrappers
vi.mock('#q-app/wrappers', () => ({
  defineBoot: (fn: any) => fn,
  defineSsrMiddleware: (fn: any) => fn,
  defineConfig: (fn: any) => fn
}))

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
  debounce: (fn: any) => fn
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

config.global.stubs = {
  'q-page': { template: '<div><slot /></div>' },
  'q-layout': { template: '<div><slot /></div>' },
  'q-header': { template: '<div><slot /></div>' },
  'q-drawer': { template: '<div><slot /></div>' },
  'q-page-container': { template: '<div><slot /></div>' },
  'q-toolbar': { template: '<div><slot /></div>' },
  'q-toolbar-title': { template: '<div><slot /></div>' },
  'q-btn': { template: '<button @click="$emit(\'click\')"><slot /></button>' },
  'q-icon': { template: '<i><slot /></i>' },
  'q-avatar': { template: '<div><slot /></div>' },
  'q-badge': { template: '<span><slot /></span>' },
  'q-card': { template: '<div><slot /></div>' },
  'q-card-section': { template: '<div><slot /></div>' },
  'q-card-actions': { template: '<div><slot /></div>' },
  'q-list': { template: '<div><slot /></div>' },
  'q-item': { template: '<div><slot /></div>' },
  'q-item-section': { template: '<div><slot /></div>' },
  'q-item-label': { template: '<div><slot /></div>' },
  'q-toggle': { template: '<input type="checkbox" />' },
  'q-select': { template: '<div />' },
  'q-input': { template: '<input />' },
  'q-tabs': { template: '<div><slot /></div>' },
  'q-tab': { template: '<div><slot /></div>' },
  'q-separator': { template: '<hr />' },
  'q-tooltip': { template: '<div />' },
  'q-checkbox': { template: '<input type="checkbox" />' },
  'q-table': { template: '<table><slot /></table>' },
  'q-td': { template: '<td><slot /></td>' },
  'q-tr': { template: '<tr><slot /></tr>' },
  'q-spinner-dots': { template: '<div />' },
  'q-spinner-grid': { template: '<div />' }
}
