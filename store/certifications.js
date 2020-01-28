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
    UPDATE ({ commit }, data) {
      return api.updateCertifications(data.cId, data.certifications)
    },
    SEND_REQUEST ({ commit }, data) {
      return api.sendRequest(data.cardId, data.formData)
    },
    ACCEPT ({ commit }, id) {
      return api.acceptCertification(id)
    },
    REFUSE ({ commit }, id) {
      return api.refuseCertification(id)
    }
  }
}
