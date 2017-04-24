import Vue from 'vue'
import Vuex from 'vuex'
import api from './api'

const store = new Vuex.Store({
  state: {
    user: null,
    app: {},
    card: null,
    platform: null,
    analyses: null,
    analysis: null,
    lists: {
      cards: [],
      analyses: [],
      trelloLists: []
    }
  },
  actions: {
    async nuxtServerInit ({ commit }, { req }) {
      if (req.session.profile) {
        commit('SET_USER', req.session.profile)
      }
      return api.info().then(info => commit('SET_APP_INFO', info))
    },
    LOGOUT: ({ commit }) => {
      return api.logout().then(() => { commit('SET_USER', null) })
    },
    FETCH_CARDS: ({ commit }) => {
      return api.getExtendedCards()
        .then(items => commit('SET_LIST', { type: 'cards', items }))
    },
    FETCH_CARD: ({ commit }, cardID) => {
      return api.getExtendedCard(cardID)
        .then(card => {
          commit('SET_CARD', card)
          commit('SET_PLATFORM', card.platform)
          commit('SET_ANALYSES', card.platform && card.platform.analyses || [])
        })
    },
    FETCH_TRELLO_LISTS: ({ commit }) => {
      return api.getLists()
        .then(items => commit('SET_LIST', { type: 'trelloLists', items }))
    },
    GET_ANALYSIS: ({ commit, state }, analysisID) => {
      const analysis = (state.analyses || []).find(a => a.id === analysisID)
      return commit('SET_ANALYSIS', analysis)
    },
    REORDER_ANALYSES: ({ commit, state }, { cardID, list }) => {
      const order = {}

      list.forEach((analysis, i) => {
        order[analysis.id] = i + 1
        Vue.set(analysis, 'order', i + 1)
      })

      commit('SET_ANALYSES', list)
      return api.reorderAnalyses(cardID, order)
    },
    CREATE_CARD: ({ commit }, card) => {
      return api.createCard(card)
    },
    SAVE_ANALYSIS: ({ commit }, { cardID, analysis }) => {
      if (analysis.id) {
        return api.updateAnalysis(cardID, analysis)
      } else {
        return api.createAnalysis(cardID, analysis)
      }
    },
    DELETE_ANALYSIS: ({ commit }, { cardID, analysisID }) => {
      return api.deleteAnalysis(cardID, analysisID).then(() => {
        commit('REMOVE_ANALYSIS', analysisID)
      })
    },
    CHECK_DOMAIN: ({ commit }, domain) => {
      return api.checkDomain(domain)
    }
  },
  mutations: {
    SET_USER: (state, user) => {
      Vue.set(state, 'user', user)
    },
    SET_LIST: (state, { type, items }) => {
      Vue.set(state.lists, type, items)
    },
    SET_APP_INFO: (state, appInfo) => {
      Vue.set(state, 'app', appInfo)
    },
    SET_ANALYSIS: (state, analysis) => {
      Vue.set(state, 'analysis', analysis)
    },
    SET_ANALYSES: (state, analyses) => {
      Vue.set(state, 'analyses', analyses)
    },
    SET_PLATFORM: (state, platform) => {
      Vue.set(state, 'platform', platform)
    },
    SET_CARD: (state, card) => {
      Vue.set(state, 'card', card)
    },
    REMOVE_ANALYSIS: (state, analysisID) => {
      Vue.set(state, 'analyses', state.analyses.filter(a => a.id !== analysisID))
    }
  }
})

export default store
