export default {
  namespaced: true,
  state: () => ({
    connect: false
  }),
  mutations: {
    SOCKET_CONNECT: (state, data) => {
      state.connect = data
    }
  },
  actions: {
    SOCKET_CONNECT: ({ commit }, data) => {
      commit('SOCKET_CONNECT', data)
    }
  }
}
