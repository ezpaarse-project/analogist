'use strict';

let req     = require('request');
let config  = require('../lib/config.js');

let baseUrl = 'https://api.trello.com';
let apiKey  = config.TRELLO.KEY;
let boardID = config.TRELLO.BOARDID;

let trelloWrapper = {
  getTokenMember: function (token, callback) {
    return this.get(`/1/token/${token}/member`, callback);
  },

  getBoardMembers: function (callback) {
    return this.get(`/1/boards/${boardID}/members`, {
      qs: { fields: 'id,memberType' }
    }, callback);
  },

  createCard: function (card, token, callback) {
    return this.post(`/1/lists/${card.idList}/cards`, {
      form: card,
      qs: { 'token': token }
    },callback);
  },

  request: function (method, path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options  = {};
    }
    options        = options || {};
    options.qs     = options.qs || {};
    options.qs.key = options.qs.key || apiKey;

    options.url    = baseUrl + path;
    options.method = method;

    return req(options, callback);
  }
};

defineShorthand('get');
defineShorthand('post');
defineShorthand('put');
defineShorthand('delete');

function defineShorthand(method) {
  trelloWrapper[method] = function (path, options, callback) {
    return this.request(method, path, options, callback);
  };
}

module.exports = trelloWrapper;
