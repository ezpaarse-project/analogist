import Vue from 'vue'
import Vuex from 'vuex'
import api from './api'

const store = new Vuex.Store({
  state: {
    app: {},
    current: {
      card: null,
      platform: null
    },
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
      return api.getCard(cardID)
        .then(card => commit('SET_CURRENT_CARD', card))
    },
    FETCH_PLATFORM: ({ commit }, cardID) => {
      return api.getPlatform(cardID)
        .then(platform => commit('SET_CURRENT_PLATFORM', platform))
    },
    FETCH_TRELLO_LISTS: ({ commit }) => {
      return api.getLists()
        .then(items => commit('SET_LIST', { type: 'trelloLists', items }))
    }
  },
  mutations: {
    SET_LIST: (state, { type, items }) => {
      state.lists[type] = items
    },
    SET_APP_INFO: (state, appInfo) => {
      Vue.set(state, 'app', appInfo)
    },
    SET_CURRENT_CARD: (state, card) => {
      Vue.set(state.current, 'card', card)
    },
    SET_CURRENT_PLATFORM: (state, platform) => {
      Vue.set(state.current, 'platform', platform)
    }
  }
})

export default store
