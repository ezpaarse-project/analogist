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
    return this.get(`/1/boards/${boardID}/cards/all`, {
      qs: {
        fields: 'id,name,idList,closed,dateLastActivity'
      }
    }, parseJson(callback))
  },

  getCardsCount: function (callback) {
    return this.get(`/1/boards/${boardID}/cards/all`, {
      qs: {
        fields: 'id,closed'
      }
    }, parseJson(callback))
  },

  getCard: function (cardID, callback) {
    return this.get(`/1/cards/${cardID}`, {
      qs: {
        members: true,
        member_fields: 'avatarUrl,initials,fullName',
        fields: 'id,name,desc,closed,idMembers,idList,dateLastActivity'
      }
    }, parseJson(callback))
  },

  getLists: function (callback) {
    return this.get(`/1/boards/${boardID}/lists`, {
      qs: {
        fields: 'id,name'
      }
    }, parseJson(callback))
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

  getBoardAdmins: function (token, callback) {
    return this.get(`/1/boards/${boardID}/memberships`, {
      qs: {
        token,
        filter: 'admin'
      }
    }, parseJson(callback))
  },

  getBoardMemberships: function (callback) {
    return this.get(`/1/boards/${boardID}/memberships`, {
      qs: {
        orgMemberType: true,
        member: true,
        member_fields: 'fullName,avatarUrl,initials,username'
      }
    }, parseJson(callback))
  },

  getMember: function (userId, callback) {
    return this.get(`/1//members/${userId}`, {
      qs: {}
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

  uncloseCard: function (cardID, token, callback) {
    return this.put(`/1/cards/${cardID}`, {
      qs: { token, closed: 'false' }
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
