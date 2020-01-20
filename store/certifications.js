import api from './api'

export default {
  namespaced: true,
  actions: {
    UPDATE ({ commit }, data) {
      return api.updateCertifications(data.cId, data.certifications)
    },
    SEND_REQUEST ({ commit }, data) {
      return api.sendRequest(data)
    }
  }
}
