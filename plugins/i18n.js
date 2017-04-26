import Vue from 'vue'
import VueI18n from 'vue-i18n'
import moment from 'moment'

Vue.use(VueI18n)
moment.locale('fr')

const i18n = new VueI18n({
  locale: 'fr',
  fallbackLocale: 'fr',
  messages: {
    'en': require('~/locales/en.json'),
    'fr': require('~/locales/fr.json')
  }
})

export default i18n
