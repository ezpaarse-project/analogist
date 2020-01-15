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
    '~/assets/css/main.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/ezlogger.js', ssr: false },
    { src: '~/plugins/storeInit.js', ssr: false },
    { src: '~/plugins/i18n.js', ssr: false },
    { src: '~/plugins/socket.js', ssr: false }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxtjs/vuetify'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {},
  /*
  ** Auth configuration
  ** See https://auth.nuxtjs.org/
  */
  auth: {},
  vuetify: {
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
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    }
  }
}
