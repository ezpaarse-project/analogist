import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import colors from 'vuetify/es5/util/colors'

Vue.use(Vuetify)

export default ctx => {
  const vuetify = new Vuetify({
    font: {
      family: 'Roboto'
    },
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
  })

  ctx.app.vuetify = vuetify
  ctx.$vuetify = vuetify.framework
}
