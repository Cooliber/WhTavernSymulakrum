// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Static Site Generation for Netlify deployment
  ssr: true,
  nitro: {
    preset: 'netlify-static',
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/characters',
        '/tavern',
        '/gm-dashboard',
        '/settings',
        '/about',
        '/generators',
        '/inspira-test',
        '/battle',
        '/inventory',
        '/map',
        '/test-components',
        '/conversations',
        '/quests'
      ]
    }
  },

  // Modules for Warhammer Tavern v3 with Inspira UI
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n'
  ],

  // Auto-import components
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // CSS Configuration - Removed to fix path resolution issues
  // CSS files are now imported in app.vue
  css: [],

  // Google Fonts for Warhammer theming
  googleFonts: {
    families: {
      'Cinzel': [400, 500, 600, 700],
      'Uncial Antiqua': [400],
      'MedievalSharp': [400],
      'Inter': [300, 400, 500, 600, 700]
    },
    display: 'swap',
    preload: true
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false // Disabled for faster development
  },

  // Development server configuration
  devServer: {
    port: 5920,
    host: '0.0.0.0'
  },

  // Additional Nitro configuration for development
  // Production configuration is handled above

  // Vite configuration for optimizations
  vite: {
    optimizeDeps: {
      include: ['gsap', 'three', 'framer-motion']
    },
    server: {
      port: 5920,
      host: '0.0.0.0'
    }
  },

  // Nitro configuration for deployment
  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server',
    experimental: {
      wasm: true
    },
    storage: {
      redis: {
        driver: 'redis',
        // Redis configuration will be set via environment variables
      }
    }
  },

  // App configuration
  app: {
    head: {
      title: 'Warhammer Tavern Simulator v3',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Immersive Warhammer Fantasy Tavern Simulator with AI-powered NPCs' }
      ]
    }
  },

  // i18n Configuration
  i18n: {
    locales: [
      {
        code: 'pl',
        iso: 'pl-PL',
        name: 'Polski',
        file: 'pl.json'
      },
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en.json'
      }
    ],
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'pl',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'pl'
    }
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (server-side only)
    groqApiKey: process.env.GROQ_API_KEY || '',
    cerebrasApiKey: process.env.CEREBRAS_API_KEY || '',
    groqApiBase: process.env.GROQ_API_BASE || 'https://api.groq.com/openai/v1',
    cerebrasApiBase: process.env.CEREBRAS_API_BASE || 'https://api.cerebras.ai/v1',
    sessionPassword: process.env.NUXT_SESSION_PASSWORD || '',
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    redisUrl: process.env.REDIS_URL || '',
    cacheTtl: parseInt(process.env.CACHE_TTL || '3600'),
    
    // Public keys (exposed to client-side)
    public: {
      apiBase: process.env.API_BASE || 'http://localhost:8000'
    }
  }
})
