import Vue from 'vue'
import api from './api'

export default {
  namespaced: true,
  state: {
    badges: null,
    visibility: false,
    users: null,
    members: null,
    ping: null,
    metrics: null,
    userBadges: null
  },
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
    },
    SET_MEMBERS (state, members) {
      Vue.set(state, 'members', members)
    },
    SET_USER_BADGES (state, badges) {
      Vue.set(state, 'userBadges', badges)
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
    getMetrics ({ commit }) {
      return api.getMetrics().then((res) => {
        if (res.status === 'success') commit('SET_METRICS', res.data.metrics)
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
    },
    getUsers ({ commit, state }, badgeId) {
      return api.getUsers({ badgeId }).then((res) => {
        if (res.status === 'success') {
          commit('SET_USERS', res.data)

          return api.getBoardMembers().then((res) => {
            commit('SET_MEMBERS', res)
          }).catch((response) => {
            // eslint-disable-next-line
            console.log(response)
          })
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    }
  }
}
