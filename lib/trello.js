'use strict';

var request = require('request');
var config  = require('../lib/config.js');

function TrelloWrapper() {
  this.baseUrl = 'https://api.trello.com';
  this.apiKey  = config.TRELLO.KEY;
};

TrelloWrapper.prototype.getTokenMember = function(token) {
  return this.get('/1/token/' + token + '/member');
};

TrelloWrapper.prototype.request = function(method, path, options) {
  options        = options || {};
  options.qs     = options.qs || {};
  options.qs.key = options.qs.key || this.apiKey;

  options.url    = this.baseUrl + path;
  options.method = method;

  return request(options);
};

function defineShorthand(method) {
  TrelloWrapper.prototype[method] = function (path, options) {
    options = options || {};
    options.method = method;

    return this.request(method, path, options);
  }
}

defineShorthand('get', 'GET');
defineShorthand('head', 'HEAD');
defineShorthand('post', 'POST');
defineShorthand('put', 'PUT');
defineShorthand('patch', 'PATCH');
defineShorthand('del', 'DELETE');

module.exports = new TrelloWrapper();
