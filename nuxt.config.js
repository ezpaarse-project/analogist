const colors = require('vuetify/es5/util/colors').default

module.exports = {
  /*
  ** Headers of the page
  */
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
  telemetry: false,
  mode: 'spa',
  loading: { color: '#FFFFFF' },
  loadingIndicator: {
    name: 'folding-cube',
    color: '#E10D1A'
  },
  router: {
    middleware: ['ssr-cookie']
  },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/main.css',
    '@mdi/font/css/materialdesignicons.min.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/axios.js', ssr: false },
    { src: '~/plugins/dateFns.js', ssr: false },
    { src: '~/plugins/ezlogger.js', ssr: false },
    { src: '~/plugins/storeInit.js', ssr: false },
    { src: '~/plugins/socket.js', ssr: false }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/vuetify',
    '@mdi/font'
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
    proxy: true
  },
  /*
  ** Auth configuration
  ** See https://auth.nuxtjs.org/
  */
  auth: {},
  vuetify: {
    icons: {
      iconfont: 'mdi'
    },
    theme: {
      themes: {
        dark: {
          primary: colors.red.accent3
        },
        light: {
          primary: colors.red.accent3
        }
      }
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
  /*
  ** Build configuration
  */
  build: {
    analyze: true,
    extractCSS: true,
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
