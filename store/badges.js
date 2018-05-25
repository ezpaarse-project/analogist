import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'

const appUrl = 'http://localhost:4000'

export default {
  namespaced: true,
  state: {
    badges: null
  },
  mutations: {
    SET_BADGES (state, badges) {
      Vue.set(state, 'badges', badges)
    }
  },
  actions: { 
    getBadges ({ commit }, email) {
      axios({
        method: 'GET',
        url: `${appUrl}/badges?email=${email}`
      })
      .then((res) => {
        if (res.data.status === 'success') {
          const badges = res.data.data
          badges.map(badge => badge.issued_on = moment.unix(badge.issued_on).format('DD/MM/YYYY'))

          commit('SET_BADGES', badges)
        }
      })
      .catch((response) => {
        console.log(response)
      })
    }
  }
}
