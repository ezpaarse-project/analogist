import Vue from 'vue'
import axios from 'axios'
import api from './api'
import moment from 'moment'

const appUrl = 'http://localhost:4000'

export default {
  namespaced: true,
  state: {
    badges: null,
    metrics: null,
    ping: null
  },
  mutations: {
    SET_BADGES (state, badges) {
      Vue.set(state, 'badges', badges)
    },
    SET_METRICS (state, metrics) {
      Vue.set(state, 'metrics', metrics)
    },
    SET_PING (state, ping) {
      Vue.set(state, 'ping', ping)
    }
  },
  actions: {
    getBadges ({ commit }, params) {
      return api.getBadges().then((res) => {
        console.log(res)
        if (res.data.status === 'success') {
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
    getMetrics ({ commit }) {
      return api.getMetrics().then((res) => {
        if (res.data.status === 'success') {
          commit('SET_METRICS', res.data)
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    getPing ({ commit }) {
      return api.getPing().then((res) => {
        if (res.data.status === 'success') {
          commit('SET_PING', (res.data === 'pong'))
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    }
  }
}
