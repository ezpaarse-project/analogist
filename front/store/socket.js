export default {
  namespaced: true,
  state: () => ({
    connect: false,
  }),
  mutations: {
    SOCKET_CONNECT: (state, data) => {
      // eslint-disable-next-line no-param-reassign
      state.connect = data;
    },
  },
  actions: {
    SOCKET_CONNECT: ({ commit }, data) => {
      commit('SOCKET_CONNECT', data);
    },
  },
};
