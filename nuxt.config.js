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
  router: {
    middleware: ['ssr-cookie']
  },
  plugins: [
    // '~/plugins/axios.js',
    '~/plugins/vuetify.js',
    '~/plugins/i18n.js'
  ],
  /*
  ** Global CSS
  */
  css: [
    '~/assets/css/main.css',
    'mdi/css/materialdesignicons.min.css',
    'vuetify/dist/vuetify.min.css'
  ],
  /*
  ** Add global packages
  */
  build: {
    vendor: [
      'axios',
      'vuetify',
      'vue-i18n',
      'vuedraggable',
      'moment',
      'file-saver'
    ]
  }
}
