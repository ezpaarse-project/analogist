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

  socket.on('BADGE_EMITTED', (data) => {
    if (data.emitted) {
      store.dispatch('snacks/success', 'badges.emitted')
    }
  })
  socket.on('BADGE_EMITTED_MANUALLY', (data) => {
    if (data.emitted) {
      store.dispatch('snacks/success', 'badges.issued')
    }
  })
  socket.on('BADGE_ALREADY_OWNED', () => {
    store.dispatch('snacks/info', 'badges.owned')
  })

  if (!app.socket) app.socket = socket
}
