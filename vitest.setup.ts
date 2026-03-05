import { vi } from 'vitest'

// Mock Quasar wrappers
vi.mock('#q-app/wrappers', () => ({
  defineBoot: (fn: any) => fn,
  defineSsrMiddleware: (fn: any) => fn,
  defineConfig: (fn: any) => fn
}))

// Mock Quasar's useQuasar if needed (though not used in stores usually)
vi.mock('quasar', () => ({
  useQuasar: () => ({
    notify: vi.fn(),
    dialog: vi.fn()
  }),
  defineBoot: (fn: any) => fn
}))
