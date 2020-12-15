// eslint-disable-next-line import/no-extraneous-dependencies
import Vue from 'vue';
import api from './api';

export default {
  namespaced: true,
  state: {
    certificationsEvents: null,
  },
  mutations: {
    SET_CERTIFICATIONS_EVENTS(state, data) {
      Vue.set(state, 'certificationsEvents', data);
    },
  },
  actions: {
    GET_CERTIFICATIONS_EVENTS({ commit }) {
      return api.getCertificationsEvents().then((res) => {
        commit('SET_CERTIFICATIONS_EVENTS', res);
      });
    },
    // eslint-disable-next-line no-unused-vars
    SEND_REQUEST({ commit }, data) {
      return api.sendRequest(data.cardID, data.formData);
    },
    // eslint-disable-next-line no-unused-vars
    ACCEPT({ commit }, data) {
      return api.acceptCertification(data);
    },
    // eslint-disable-next-line no-unused-vars
    REFUSE({ commit }, data) {
      return api.refuseCertification(data);
    },
  },
};
