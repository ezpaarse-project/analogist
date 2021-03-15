import Vue from 'vue'
import api from './api'

export default {
  namespaced: true,
  state: () => ({
    badges: null,
    visibility: false,
    users: null,
    ping: null,
    metrics: null
  }),
  mutations: {
    SET_BADGES (state, badges) {
      Vue.set(state, 'badges', badges)
    },
    SET_PING (state, ping) {
      Vue.set(state, 'ping', ping)
    },
    SET_METRICS (state, metrics) {
      Vue.set(state, 'metrics', metrics)
    },
    SET_VISIBILITY (state, visibility) {
      Vue.set(state, 'visibility', visibility)
    },
    SET_USERS (state, users) {
      Vue.set(state, 'users', users)
    }
  },
  actions: {
    getBadges ({ commit }, params) {
      return api.getBadges(params.id).then((res) => {
        if (res.status === 'success') {
          const badges = res.data

          commit('SET_BADGES', badges.badges)
          commit('SET_VISIBILITY', badges.visibility)
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    getPing ({ commit }) {
      return api.getPing().then((res) => {
        if (res.status === 'success') commit('SET_PING', (res.data === 'pong'))
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    getMembers ({ commit }, auth) {
      if (auth) {
        return api.getBoardMembers().then((res) => {
          const users = res.map(({ member }) => member)
          commit('SET_USERS', users)
        })
      }
    },
    getMetrics ({ commit, state }, admin) {
      return api.getMetrics().then(({ data, status }) => {
        if (status === 'success') {
          const metrics = data.metrics

          if (admin && state.users) {
            metrics.forEach((metric, index) => {
              api.getUsers(metric.badge.id).then(({ data }) => {
                const usersData = data

                usersData.forEach(({ userId }, index) => {
                  const user = state.users.find(({ id }) => id === userId)
                  usersData[index] = { ...usersData[index], ...user }
                })

                metrics[index].users = usersData || []
              }).catch((response) => {
                metrics[index].users = []
              })
            })
          }

          commit('SET_METRICS', metrics)
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    emit ({ commit }, data) {
      return api.emit(data).then((res) => {
        // eslint-disable-next-line
        console.log(res)
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    setVisiblity ({ commit }, visibility) {
      return api.setVisiblity({ visibility }).then((res) => {
        if (res.status === 'success') commit('SET_VISIBILITY', visibility)
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    }
  }
}
