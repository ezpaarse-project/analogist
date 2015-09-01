'use strict';

var trello = require('./trello.js');
var config = require('./config.js');

/**
 * Check that the user in the session is a member of the board
 */
exports.authorize = function (req, res, next) {
  if (config.BYPASS) { return next(); }

  var oauth = req.session.oauth;

  if (!oauth || !oauth.token || !oauth.secret) {
    return notAuthenticated();
  }

  var thirtyMinutes = 1000 * 60 * 30;

  if (oauth.authorized && oauth.lastChecked && oauth.lastChecked + thirtyMinutes > Date.now()) {
    return checkAuthorization()
  }

  trello.getTokenMember(oauth.token, function (err, res, body) {
    if (err) { return next(err); }

    var profile;
    try {
      profile = JSON.parse(body);
    } catch (e) {
      return next(e);
    }

    oauth.authorized = (profile.idBoards || []).some(function (board) {
      return board == config.TRELLO.BOARDID;
    });
    oauth.lastChecked = Date.now();

    checkAuthorization();
  });

  function checkAuthorization() {
    if (oauth.authorized) {
      next();
    } else {
      notAuthorized();
    }
  }

  function notAuthenticated() {
    var err = new Error('not authenticated');
    err.status = 401;
    next(err);
  }

  function notAuthorized() {
    var err = new Error('not authorized');
    err.status = 403;
    next(err);
  }
};
