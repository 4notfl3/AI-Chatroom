export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://120.26.54.176:8001',
        changeOrigin: true
      }
    }
  }
})
