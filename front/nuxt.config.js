const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin');

module.exports = {
  ssr: false,

  head: {
    title: 'AnalogIST',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Analyses for ezPAARSE' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto' },
    ],
  },

  telemetry: false,

  loading: { color: '#FFFFFF' },
  loadingIndicator: {
    name: 'folding-cube',
    color: '#E10D1A',
  },

  components: true,

  router: {
    middleware: ['ssr-cookie'],
  },

  css: [
    '~/assets/css/main.css',
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/axios.js' },
    { src: '~/plugins/dateFns.js' },
    { src: '~/plugins/ezlogger.js' },
    { src: '~/plugins/storeInit.js' },
    { src: '~/plugins/socket.js' },
    { src: '~/plugins/vuetify.js' },
  ],

  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [],

  /*
  ** Nuxt.js modules
  */
  modules: [
    ['@nuxtjs/proxy', {
      pathRewrite: {
        '/api': process.env.API_URL,
      },
    }],
    ['@nuxtjs/axios', {
      prefix: '/api',
      credentials: true,
      proxy: true,
    }],
    '@nuxtjs/auth',
    'nuxt-i18n',
  ],

  publicRuntimeConfig: {
    axios: {
      baseURL: process.env.API_URL,
    },
  },

  /*
  ** Auth configuration
  ** See https://auth.nuxtjs.org/
  */
  auth: {},

  i18n: {
    locales: [
      {
        name: 'Français',
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr.json',
      },
      {
        name: 'English',
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
      },
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
      fallbackLocale: 'en',
    },
  },

  env: {
    ezpaarseUrl: process.env.ANG_EZPAARSE_URL || 'http://dev.ezpaarse.org',
  },

  dev: process.env.NODE_ENV !== 'production',

  /*
  ** Build configuration
  */
  build: {
    analyze: true,
    extractCSS: true,
    plugins: [new VuetifyLoaderPlugin()],
    extend(config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        });
      }
    },
  },
};
