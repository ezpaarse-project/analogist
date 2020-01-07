import Vue from 'vue'
import api from './api'

export default {
  namespaced: true,
  state: {
    certifications: {}
  },
  actions: {
    FETCH_CERTIFICATION ({ commit }, cId) {
      return api.getCertifications(cId).then(res => commit('UPDATE_CERTIFICATION', res))
    },
    UPDATE ({ commit }, data) {
      return api.updateCertifications(data.cId, data.certifications).then((res) => {
        if (res) {
          commit('UPDATE_CERTIFICATION', res.certifications)
        }
      })
    }
  },
  mutations: {
    UPDATE_CERTIFICATION (state, certifications) {
      Vue.set(state, 'certifications', certifications)
    }
  }
}
