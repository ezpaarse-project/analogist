import Vue from 'vue'
import api from './api'
import moment from 'moment'

export default {
  namespaced: true,
  state: {
    badges: null,
    ping: null,
    metrics: null
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
    }
  },
  actions: {
    getBadges ({ commit }, params) {
      return api.getBadges().then((res) => {
        if (res.status === 'success') {
          const badges = res.data

          // eslint-disable-next-line
          badges.map(badge => ((badge.issued_on !== undefined) ? moment.unix(badge.issued_on).format((params.locale === 'fr') ?  'DD/MM/YYYY' : 'YYYY-MM-DD') : null))

          commit('SET_BADGES', badges)
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    getPing ({ commit }) {
      return api.getPing().then((res) => {
        if (res.status === 'success') {
          commit('SET_PING', (res.data === 'pong'))
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    getMetrics ({ commit }) {
      return api.getMetrics().then((res) => {
        if (res.status === 'success') {
          commit('SET_METRICS', res.data.metrics)
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
    }
  }
}
