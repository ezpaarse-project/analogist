/* eslint-disable nuxt/no-cjs-in-config */
const pkg = require('./package.json')

module.exports = {
  dev: process.env.NODE_ENV !== 'production',
  ssr: false,
  telemetry: false,

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  head: {
    title: 'AnalogIST',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Analyses for ezPAARSE' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto' }
    ]
  },

  loading: { color: '#FFFFFF' },
  loadingIndicator: {
    name: 'folding-cube',
    color: '#E10D1A'
  },

  router: {
    middleware: ['ssr-cookie']
  },

  css: [
    '~/assets/css/main.css'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/axios.js' },
    { src: '~/plugins/dateFns.js' },
    { src: '~/plugins/ezlogger.js' },
    { src: '~/plugins/socket.js' }
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    'nuxt-i18n'
  ],

  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/',
    proxy: true
  },

  /*
  ** Auth configuration
  ** See https://auth.nuxtjs.org/
  */
  auth: {
    strategies: {
      local: {
        endpoints: {
          logout: { url: '/api/auth/logout', method: 'get' },
          user: { url: '/api/auth/loggedin', method: 'get', propertyName: '' }
        },
        tokenRequired: false
      }
    },
    redirect: {
      login: '/',
      logout: '/',
      home: '/',
      callback: '/'
    }
  },

  i18n: {
    locales: [
      {
        name: 'Français',
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr.json'
      },
      {
        name: 'English',
        code: 'en',
        iso: 'en-US',
        file: 'en.json'
      }
    ],
    baseUrl: '/',
    defaultLocale: 'fr',
    lazy: true,
    langDir: 'locales/',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'analogist_i18n',
      alwaysRedirect: true,
      fallbackLocale: 'en'
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: '#FF1744'
        },
        light: {
          primary: '#FF1744'
        }
      }
    }
  },

  publicRuntimeConfig: {
    ezpaarseUrl: process.env.ANG_EZPAARSE_URL || 'https://preprod.ezpaarse.org',
    version: pkg.version,
    boardId: process.env.ANG_TRELLO_BOARDID,
    badgesEnabled: process.env.ANG_BADGES_ENABLED
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}
