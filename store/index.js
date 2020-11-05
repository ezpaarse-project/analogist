import Vue from 'vue'
import Vuex from 'vuex'
import api from './api'
import ezlogger from './ezlogger'
import badges from './badges'
import snacks from './snacks'
import socket from './socket'
import certifications from './certifications'

const store = () => new Vuex.Store({
  modules: {
    ezlogger,
    badges,
    snacks,
    socket,
    certifications
  },
  state: {
    user: null,
    app: {},
    card: null,
    platform: null,
    analyses: null,
    analysis: null,
    cards: [],
    trelloLists: [],
    displayAllCards: false,
    searchText: '',
    searchLists: [],
    searchCertifications: [],
    searchDateOrder: 'desc',
    searchStatusOrder: 'waiting',
    searchYearsOrder: null,
    searchPage: 1,
    drawer: true,
    lastVisitedAnalysis: null,
    trelloBoardMembers: [],
    lastVisitedPlatform: null
  },
  actions: {
    FETCH_PROFILE ({ commit }) {
      return api.getProfile().then(profile => commit('SET_USER', profile))
    },
    FETCH_APP_INFO ({ commit }) {
      return api.info().then(info => commit('SET_APP_INFO', info))
    },
    LOGOUT ({ commit }) {
      return api.logout().then(() => { commit('SET_USER', null) })
    },
    FETCH_CARDS ({ commit }) {
      return api.getExtendedCards().then(items => commit('SET_CARDS', items))
    },
    FETCH_CARD ({ commit }, cardID) {
      return api.getExtendedCard(cardID)
        .then(card => {
          commit('SET_CARD', card)
          commit('SET_PLATFORM', card.platform)
          commit('SET_ANALYSES', (card.platform && card.platform.analyses) || [])
        })
    },
    FETCH_TRELLO_LISTS ({ commit }) {
      return api.getLists().then(items => commit('SET_TRELLO_LISTS', Array.isArray(items) ? items : []))
    },
    GET_ANALYSIS ({ commit, state }, analysisID) {
      const analysis = (state.analyses || []).find(a => a.id === analysisID)
      return commit('SET_ANALYSIS', analysis)
    },
    REORDER_ANALYSES ({ commit, state }, { cardID, list }) {
      const order = {}

      list.forEach((analysis, i) => {
        order[analysis.id] = i + 1
        Vue.set(analysis, 'order', i + 1)
      })

      commit('SET_ANALYSES', list)
      return api.reorderAnalyses(cardID, order)
    },
    CREATE_CARD ({ commit }, card) {
      return api.createCard(card)
    },
    ARCHIVE_CARD ({ commit }, cardID) {
      return api.deletePlatform(cardID)
    },
    UNARCHIVE_CARD ({ commit }, cardID) {
      return api.addPlatform(cardID)
    },
    SAVE_ANALYSIS ({ commit }, { cardID, analysis }) {
      if (analysis.id) {
        return api.updateAnalysis(cardID, analysis)
      } else {
        return api.createAnalysis(cardID, analysis)
      }
    },
    DELETE_ANALYSIS ({ commit }, { cardID, analysisID }) {
      return api.deleteAnalysis(cardID, analysisID).then(() => {
        commit('REMOVE_ANALYSIS', analysisID)
      })
    },
    CHECK_DOMAIN ({ commit }, domain) {
      return api.checkDomain(domain)
    },
    ADD_CARD_MEMBER ({ commit }, { card, user }) {
      return api.addUserToCard(card, user)
    },
    MOVE_CARD ({ commit }, { card, listID }) {
      return api.moveCard(card, listID)
    },
    UPDATE_SEARCH_TEXT ({ commit }, value) {
      return commit('SET_SEARCH_TEXT', value)
    },
    UPDATE_SEARCH_LISTS ({ commit }, value) {
      return commit('SET_SEARCH_LISTS', value)
    },
    UPDATE_SEARCH_CERTIFICATIONS ({ commit }, value) {
      return commit('SET_SEARCH_CERTIFICATIONS', value)
    },
    UPDATE_SEARCH_DATE_ORDER ({ commit }, value) {
      return commit('SET_SEARCH_DATE_ORDER', value)
    },
    UPDATE_SEARCH_STATUS_ORDER ({ commit }, value) {
      return commit('SET_SEARCH_STATUS_ORDER', value)
    },
    UPDATE_SEARCH_YEARS_ORDER ({ commit }, value) {
      return commit('SET_SEARCH_YEARS_ORDER', value)
    },
    SET_DRAWER ({ commit }, value) {
      commit('SET_DRAWER', value)
    },
    SET_SEARCH_PAGE ({ commit }, value) {
      commit('SET_SEARCH_PAGE', value)
    },
    SET_VISITED_ANALYSIS ({ commit }, value) {
      commit('SET_VISITED_ANALYSIS', value)
    },
    FETCH_TRELLO_BOARD_MEMBERS ({ commit }) {
      return api.getBoardMembers().then(members => commit('SET_TRELLO_BOARD_MEMBERS', members))
    },
    SET_VISITED_PLATFORM ({ commit }, value) {
      commit('SET_VISITED_PLATFORM', value)
    },
    BECOME_MEMBER () {
      return api.becomeMember()
    },
    DISPLAY_ALL_CARDS ({ commit }, value) {
      commit('DISPLAY_ALL_CARDS', value)
    }
  },
  mutations: {
    SET_SEARCH_PAGE (state, page) {
      Vue.set(state, 'searchPage', page)
    },
    SET_DRAWER (state, bool) {
      Vue.set(state, 'drawer', bool)
    },
    SET_USER (state, user) {
      Vue.set(state, 'user', user)
    },
    SET_CARDS (state, items) {
      Vue.set(state, 'cards', items)
    },
    SET_TRELLO_LISTS (state, items) {
      Vue.set(state, 'trelloLists', items)
    },
    SET_APP_INFO (state, appInfo) {
      Vue.set(state, 'app', appInfo)
    },
    SET_ANALYSIS (state, analysis) {
      Vue.set(state, 'analysis', analysis)
    },
    SET_ANALYSES (state, analyses) {
      Vue.set(state, 'analyses', analyses)
    },
    SET_PLATFORM (state, platform) {
      Vue.set(state, 'platform', platform)
    },
    SET_CARD (state, card) {
      Vue.set(state, 'card', card)
    },
    SET_SEARCH_TEXT (state, searchText) {
      Vue.set(state, 'searchText', searchText)
    },
    SET_SEARCH_LISTS (state, searchLists) {
      Vue.set(state, 'searchLists', searchLists)
    },
    SET_SEARCH_CERTIFICATIONS (state, searchCertifications) {
      Vue.set(state, 'searchCertifications', searchCertifications)
    },
    SET_SEARCH_DATE_ORDER (state, searchDateOrder) {
      Vue.set(state, 'searchDateOrder', searchDateOrder)
    },
    SET_SEARCH_STATUS_ORDER (state, searchStatusOrder) {
      Vue.set(state, 'searchStatusOrder', searchStatusOrder)
    },
    SET_SEARCH_YEARS_ORDER (state, searchYearsOrder) {
      Vue.set(state, 'searchYearsOrder', searchYearsOrder)
    },
    REMOVE_ANALYSIS (state, analysisID) {
      Vue.set(state, 'analyses', state.analyses.filter(a => a.id !== analysisID))
    },
    SET_VISITED_ANALYSIS (state, analysisID) {
      Vue.set(state, 'lastVisitedAnalysis', analysisID)
    },
    SET_TRELLO_BOARD_MEMBERS (state, trelloBoardMembers) {
      Vue.set(state, 'trelloBoardMembers', trelloBoardMembers)
    },
    SET_VISITED_PLATFORM (state, cardID) {
      Vue.set(state, 'lastVisitedPlatform', cardID)
    },
    DISPLAY_ALL_CARDS (state, value) {
      Vue.set(state, 'displayAllCards', value)
    }
  }
})

export default store
