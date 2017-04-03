import Vue from 'vue'
import Vuex from 'vuex'
import api from './api'

const store = new Vuex.Store({
  state: {
    app: {},
    card: null,
    lists: {
      cards: [],
      analyses: [],
      trelloLists: []
    }
  },
  actions: {
    nuxtServerInit ({ commit }, { req }) {
      return api.info().then(info => commit('SET_APP_INFO', info))
    },
    FETCH_CARDS: ({ commit }) => {
      return api.getExtendedCards()
        .then(items => commit('SET_LIST', { type: 'cards', items }))
    },
    FETCH_CARD: ({ commit }, cardID) => {
      return api.getExtendedCard(cardID)
        .then(card => commit('SET_CARD', card))
    },
    FETCH_TRELLO_LISTS: ({ commit }) => {
      return api.getLists()
        .then(items => commit('SET_LIST', { type: 'trelloLists', items }))
    },
    GET_ANALYSIS: ({ commit, state }, analysisID) => {
      const analysis = (state.analyses || []).find(a => a.id === analysisID)
      return commit('SET_ANALYSIS', analysis)
    }
  },
  mutations: {
    SET_LIST: (state, { type, items }) => {
      state.lists[type] = items
    },
    SET_APP_INFO: (state, appInfo) => {
      Vue.set(state, 'app', appInfo)
    },
    SET_ANALYSIS: (state, analysis) => {
      Vue.set(state, 'analysis', analysis)
    },
    SET_CARD: (state, card) => {
      Vue.set(state, 'card', card)
      Vue.set(state, 'platform', card.platform)
      Vue.set(state, 'analyses', card.platform && card.platform.analyses || [])
    }
  }
})

export default store
