import { set } from 'vue'
import { Store } from 'vuex'
import api from './api'
import ezlogger from './ezlogger'
import badges from './badges'
import snacks from './snacks'
import socket from './socket'
import certifications from './certifications'

const store = () => new Store({
  modules: {
    ezlogger,
    badges,
    snacks,
    socket,
    certifications
  },
  state: () => ({
    app: {},
    card: null,
    platform: null,
    analyses: null,
    analysis: null,
    analysisHistory: [],
    historySelected: null,
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
  }),
  actions: {
    FETCH_APP_INFO ({ commit }) {
      return api.info().then(info => commit('SET_APP_INFO', info))
    },
    FETCH_CARDS ({ commit }) {
      return api.getExtendedCards().then(items => commit('SET_CARDS', items))
    },
    FETCH_CARD ({ commit }, cardID) {
      return api.getExtendedCard(cardID)
        .then((card) => {
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
    GET_ANALYSIS_HISTORY ({ commit }, analysisID) {
      return api.getAnalysisHistory(analysisID).then(({ data }) => commit('SET_ANALYSIS_HISTORY', Array.isArray(data) ? data : []))
    },
    SET_ANALYSIS_HISTORY_SELECTED ({ commit }, historySelected) {
      commit('SET_ANALYSIS_HISTORY_SELECTED', historySelected)
    },
    REORDER_ANALYSES ({ commit, state }, { cardID, list }) {
      const order = {}

      list.forEach((analysis, i) => {
        order[analysis.id] = i + 1
        set(analysis, 'order', i + 1)
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
      set(state, 'searchPage', page)
    },
    SET_DRAWER (state, bool) {
      set(state, 'drawer', bool)
    },
    SET_CARDS (state, items) {
      set(state, 'cards', items)
    },
    SET_TRELLO_LISTS (state, items) {
      set(state, 'trelloLists', items)
    },
    SET_APP_INFO (state, appInfo) {
      set(state, 'app', appInfo)
    },
    SET_ANALYSIS (state, analysis) {
      set(state, 'analysis', analysis)
    },
    SET_ANALYSES (state, analyses) {
      set(state, 'analyses', analyses)
    },
    SET_ANALYSIS_HISTORY (state, analysisHistory) {
      set(state, 'analysisHistory', analysisHistory)
    },
    SET_ANALYSIS_HISTORY_SELECTED (state, historySelected) {
      set(state, 'historySelected', historySelected)
    },
    SET_PLATFORM (state, platform) {
      set(state, 'platform', platform)
    },
    SET_CARD (state, card) {
      set(state, 'card', card)
    },
    SET_SEARCH_TEXT (state, searchText) {
      set(state, 'searchText', searchText)
    },
    SET_SEARCH_LISTS (state, searchLists) {
      set(state, 'searchLists', searchLists)
    },
    SET_SEARCH_CERTIFICATIONS (state, searchCertifications) {
      set(state, 'searchCertifications', searchCertifications)
    },
    SET_SEARCH_DATE_ORDER (state, searchDateOrder) {
      set(state, 'searchDateOrder', searchDateOrder)
    },
    SET_SEARCH_STATUS_ORDER (state, searchStatusOrder) {
      set(state, 'searchStatusOrder', searchStatusOrder)
    },
    SET_SEARCH_YEARS_ORDER (state, searchYearsOrder) {
      set(state, 'searchYearsOrder', searchYearsOrder)
    },
    REMOVE_ANALYSIS (state, analysisID) {
      set(state, 'analyses', state.analyses.filter(a => a.id !== analysisID))
    },
    SET_VISITED_ANALYSIS (state, analysisID) {
      set(state, 'lastVisitedAnalysis', analysisID)
    },
    SET_TRELLO_BOARD_MEMBERS (state, trelloBoardMembers) {
      set(state, 'trelloBoardMembers', trelloBoardMembers)
    },
    SET_VISITED_PLATFORM (state, cardID) {
      set(state, 'lastVisitedPlatform', cardID)
    },
    DISPLAY_ALL_CARDS (state, value) {
      set(state, 'displayAllCards', value)
    }
  }
})

export default store
