// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt'],
  alias: {
    '@': fileURLToPath(new URL('./', import.meta.url)),
  },
  css: ['@/assets/css/app.css'],   // можно оставить @
  vite: { plugins: [tailwindcss(), tsconfigPaths()] },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  }
})
