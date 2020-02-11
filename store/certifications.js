import Vue from 'vue'
import api from './api'

export default {
  namespaced: true,
  state: {
    certificationsEvents: null
  },
  mutations: {
    SET_CERTIFICATIONS_EVENTS (state, data) {
      Vue.set(state, 'certificationsEvents', data)
    }
  },
  actions: {
    GET_CERTIFICATIONS_EVENTS ({ commit }) {
      return api.getCertificationsEvents().then((res) => {
        commit('SET_CERTIFICATIONS_EVENTS', res)
      })
    },
    SEND_REQUEST ({ commit }, data) {
      return api.sendRequest(data.cardID, data.formData)
    },
    ACCEPT ({ commit }, data) {
      return api.acceptCertification(data)
    },
    REFUSE ({ commit }, data) {
      return api.refuseCertification(data)
    }
  }
}
