/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Don't ship the demo's public/ assets in the library bundle
    copyPublicDir: false,
    lib: {
      entry: 'src/index.ts',
      name: 'SearchSelect',
      // UMD uses .cjs so Node's `require` works in this "type": "module" package
      fileName: (format) => `search-select.${format}.${format === 'umd' ? 'cjs' : 'js'}`,
      // Keep the CSS file name in sync with the `./style.css` export in package.json
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
