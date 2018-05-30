import Vue from 'vue'
import axios from 'axios'
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
      return axios({
        method: 'GET',
        url: `${appUrl}/badges?id=${params.id}`
      }).then((res) => {
        if (res.data.status === 'success') {
          const badges = res.data.data

          // eslint-disable-next-line
          badges.map(badge => badge.issued_on = moment.unix(badge.issued_on).format((params.locale === 'fr') ?  'DD/MM/YYYY' : 'YYYY-MM-DD'))

          commit('SET_BADGES', badges)
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    getMetrics ({ commit }) {
      return axios({
        method: 'GET',
        url: `${appUrl}/metrics`
      }).then((res) => {
        if (res.data.status === 'success') {
          commit('SET_METRICS', res.data.data)
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    },
    getPing ({ commit }) {
      return axios({
        method: 'GET',
        url: `${appUrl}/ping`
      }).then((res) => {
        if (res.data.status === 'success') {
          commit('SET_PING', (res.data.data === 'pong'))
        }
      }).catch((response) => {
        // eslint-disable-next-line
        console.log(response)
      })
    }
  }
}
