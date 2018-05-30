'use strict'

const req     = require('request')
const config  = require('config')

const baseUrl = 'https://api.trello.com'
const apiKey  = config.trello.key
const boardID = config.trello.boardId

// FIXME: use Purest?

const trelloWrapper = {
  getTokenMember: function (token, callback) {
    return this.get(`/1/token/${token}/member`, parseJson(callback))
  },

  getBoard: function (callback) {
    return this.get(`/1/boards/${boardID}`, {
      qs: { fields: 'name,url' }
    }, parseJson(callback))
  },

  getCards: function (callback) {
    return this.get(`/1/boards/${boardID}/cards`, {
      qs: { members: 'true' }
    }, parseJson(callback))
  },

  getCard: function (cardID, callback) {
    return this.get(`/1/cards/${cardID}`, {
      qs: { members: 'true' }
    }, parseJson(callback))
  },

  getLists: function (callback) {
    return this.get(`/1/boards/${boardID}/lists`, {}, parseJson(callback))
  },

  getBoardMembers: function (callback) {
    return this.get(`/1/boards/${boardID}/members`, {
      qs: { fields: 'id,memberType' }
    }, parseJson(callback))
  },

  addCardMember: function (cardID, memberID, token, callback) {
    return this.post(`/1/card/${cardID}/members`, {
      form: { value: memberID },
      qs: { token }
    }, parseJson(callback))
  },

  updateCard: function (cardID, changes, token, callback) {
    return this.put(`/1/cards/${cardID}`, {
      form: changes,
      qs: { token }
    }, callback)
  },

  moveCard: function (cardID, listID, token, callback) {
    return this.put(`/1/cards/${cardID}/idList`, {
      qs: { token, value: listID }
    }, callback)
  },

  createCard: function (card, token, callback) {
    return this.post(`/1/lists/${card.idList}/cards`, {
      form: card,
      qs: { token }
    }, callback)
  },

  closeCard: function (cardID, token, callback) {
    return this.put(`/1/cards/${cardID}`, {
      qs: { token, closed: 'true' }
    }, callback)
  },

  request: function (method, path, options, callback) {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }
    options = options || {}
    options.qs = options.qs || {}
    options.qs.key = options.qs.key || apiKey

    options.url = `${baseUrl}${path}`
    options.method = method

    return req(options, callback)
  }
}

defineShorthand('get')
defineShorthand('post')
defineShorthand('put')
defineShorthand('delete')

function defineShorthand (method) {
  trelloWrapper[method] = function (path, options, callback) {
    return this.request(method, path, options, callback)
  }
}

function parseJson (callback) {
  if (typeof callback !== 'function') { return }

  return function (err, res, body) {
    if (err) { return callback(err) }

    try {
      return callback(null, JSON.parse(body))
    } catch (e) {
      return callback(e)
    }
  }
}

module.exports = trelloWrapper
