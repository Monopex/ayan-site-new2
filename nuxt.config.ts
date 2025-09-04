// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/i18n',
    'shadcn-nuxt'
  ],
  alias: {
    '@': fileURLToPath(new URL('./', import.meta.url)),
  },
  css: ['@/assets/css/app.css'],   // можно оставить @
  vite: { plugins: [tailwindcss(), tsconfigPaths()] },
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ru',
    locales: [
      { code: 'ru', iso: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'kz', iso: 'kz-KZ', name: 'Қазақша', file: 'kz.json' },
    ],
    lazy: true,
    langDir: 'locales',
    vueI18n: './i18n.config.ts',
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  }
})
