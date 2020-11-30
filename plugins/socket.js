import Vue from 'vue'
import io from 'socket.io-client'

const socket = io(window.location.host)

Vue.use({
  install (vue) {
    vue.prototype.$socket = socket
  }
})

export default ({ app, store }) => {
  if (socket.connected) {
    store.dispatch('socket/SOCKET_CONNECT', true)
  }
  socket.on('connect', () => {
    store.dispatch('socket/SOCKET_CONNECT', true)
  })

  if (socket.disconnected) {
    store.dispatch('socket/SOCKET_CONNECT', false)
  }
  socket.on('disconnect', () => {
    store.dispatch('socket/SOCKET_CONNECT', false)
  })

  if (!app.socket) app.socket = socket
}
