'use strict';

var request = require('request');
var config  = require('../lib/config.js');

function TrelloWrapper() {
  this.baseUrl = 'https://api.trello.com';
  this.apiKey  = config.TRELLO.KEY;
  this.boardID = config.TRELLO.BOARDID;
}

TrelloWrapper.prototype.getTokenMember = function(token, callback) {
  return this.get('/1/token/' + token + '/member', callback);
};

TrelloWrapper.prototype.createCard = function(card, token, callback) {
  return this.post('/1/lists/' + card.idList + '/cards', {
    form: card,
    qs: { 'token': token }
  },callback);
};

TrelloWrapper.prototype.request = function(method, path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }
  options        = options || {};
  options.qs     = options.qs || {};
  options.qs.key = options.qs.key || this.apiKey;

  options.url    = this.baseUrl + path;
  options.method = method;

  return request(options, callback);
};

function defineShorthand(method) {
  TrelloWrapper.prototype[method] = function (path, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options  = {};
    }
    options = options || {};
    options.method = method;

    return this.request(method, path, options, callback);
  };
}

defineShorthand('get', 'GET');
defineShorthand('head', 'HEAD');
defineShorthand('post', 'POST');
defineShorthand('put', 'PUT');
defineShorthand('patch', 'PATCH');
defineShorthand('del', 'DELETE');

module.exports = new TrelloWrapper();
