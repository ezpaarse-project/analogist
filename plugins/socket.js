import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'

export default ({ app }) => {
  Vue.use(VueSocketIO, `:3000`, app.store['socket'])
}
