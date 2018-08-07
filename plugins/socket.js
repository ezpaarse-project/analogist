import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'

export default ({ app }) => {
  Vue.use(VueSocketIO, 'http://localhost:3000', app.store['socket'])
}
