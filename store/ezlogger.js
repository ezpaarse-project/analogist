import Vue from 'vue'
import { getUnixTime } from 'date-fns'

const defaultSettings = {
  preprod: true,
  ezpaarseUrl: 'http://127.0.0.1:59599',
  proxySuffixes: [],
  headers: [
    { name: 'Double-Click-Removal', value: 'false' }
  ],
  autoRemoveNoise: false,
  patchHyphens: false,
  captureLimit: 1000
}

export default {
  namespaced: true,

  state: {
    search: '',
    settings: {},
    requests: [],
    counter: 0,
    page: 1
  },

  actions: {
    setPage ({ commit }, page) {
      commit('setPage', page)
    },

    setSearch ({ commit }, search) {
      commit('setSearch', search)
    },

    addRequest ({ commit, state }, req) {
      if (state.settings.autoRemoveNoise && isNoisy(req)) { return }

      state.settings.proxySuffixes.forEach(suffix => {
        if (!suffix || !suffix.str) { return }

        const reg = new RegExp(`^([a-z]+://[^/]+?)\\.?${regEscape(suffix.str)}(/|$)`, 'i')
        req.url = req.url.replace(reg, '$1$2')
      })

      req.lengthHeader = (req.responseHeaders || []).find(header => /^content-length$/.test(header.name))

      getPossibleUrls(req.url, state.settings.patchHyphens).forEach(url => {
        commit('addRequest', {
          url: url,
          method: req.method,
          type: req.type,
          statusCode: req.statusCode,
          timeStamp: req.timeStamp,
          startDate: getUnixTime(req.timeStamp),
          status: 'pending',
          id: ++state.counter,
          ec: null,
          contentLength: req.lengthHeader ? req.lengthHeader.value : null
        })

        if (state.requests.length > state.settings.captureLimit) {
          commit('removeOldestRequest')
        }
      })
    },

    addRequestFromUrl ({ dispatch }, url) {
      dispatch('addRequest', {
        url,
        method: 'GET',
        type: 'main_frame',
        statusCode: 200,
        timeStamp: Date.now()
      })
    },

    clearRequests ({ commit }) {
      commit('clearRequests')
    },
    filterRequests ({ commit, state }) {
      commit('setRequests', state.requests.filter(req => !isNoisy(req)))
    },

    saveSettings ({ state }) {
      localStorage.setItem('config', JSON.stringify(state.settings))
    },
    loadSettings ({ commit }) {
      let localSettings
      try {
        localSettings = JSON.parse(localStorage.getItem('config'))
      } catch (e) {
        localSettings = {}
      }

      const defaults = JSON.parse(JSON.stringify(defaultSettings))
      commit('setSettings', Object.assign({}, defaults, localSettings))
    },

    addHeader ({ commit }) { commit('addHeader') },
    addProxy ({ commit }) { commit('addProxy') },
    removeHeader ({ commit }, index) { commit('removeHeader', index) },
    removeProxy ({ commit }, index) { commit('removeProxy', index) },

    setAutoRemoveNoise ({ commit }, value) { commit('setAutoRemoveNoise', value) },
    setPatchHyphens ({ commit }, value) { commit('setPatchHyphens', value) },
    setPreprod ({ commit }, value) { commit('setPreprod', value) },
    setEzpaarseUrl ({ commit }, value) { commit('setEzpaarseUrl', value) },
    setForceParser ({ commit }, value) { commit('setForceParser', value) }
  },

  mutations: {
    setSearch (state, search) { state.search = search },
    setPage (state, page) { state.page = page },
    setSettings (state, settings) { state.settings = settings },

    setRequests (state, requests) { state.requests = requests },
    addRequest (state, req) { state.requests.unshift(req) },
    removeOldestRequest (state) { state.requests.pop() },
    clearRequests (state) { Vue.set(state, 'requests', []) },

    addHeader (state) { state.settings.headers.push({}) },
    addProxy (state) { state.settings.proxySuffixes.push({}) },
    removeHeader (state, index) { state.settings.headers.splice(index, 1) },
    removeProxy (state, index) { state.settings.proxySuffixes.splice(index, 1) },

    setAutoRemoveNoise (state, value) { state.settings.autoRemoveNoise = value },
    setPatchHyphens (state, value) { state.settings.patchHyphens = value },
    setPreprod (state, value) { state.settings.preprod = value },
    setEzpaarseUrl (state, value) { state.settings.ezpaarseUrl = value },
    setForceParser (state, value) { state.settings.forceParser = value }
  }
}

function regEscape (str) {
  return str.replace(/([.*+?^${}()|[\]\\])/g, '\\$1')
}

function isNoisy (req) {
  switch (req.type) {
    case 'image':
    case 'script':
    case 'stylesheet':
    case 'font':
      return true
  }
  return false
}

function getPossibleUrls (url, patchHyphens) {
  if (!patchHyphens) { return [url] }

  const reg = new RegExp('^([a-z]+://)([^/]+)(.*)', 'i')
  const match = reg.exec(url)

  if (!match) { return [url] }

  const parts = match[2].split('-')
  if (parts.length <= 1) { return [url] }

  let domains = [parts[0]]

  for (let i = 1; i < parts.length; i++) {
    const newDomains = []

    domains.forEach(d => {
      newDomains.push(`${d}.${parts[i]}`)
      newDomains.push(`${d}-${parts[i]}`)
    })

    domains = newDomains
  }

  return domains.map(d => `${match[1]}${d}${match[3]}`)
}
