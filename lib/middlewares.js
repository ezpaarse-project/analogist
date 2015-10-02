'use strict';

var deepEqual = require('deep-equal');
var mongo     = require('./mongo.js');
var trello    = require('./trello.js');
var config    = require('./config.js');
var ObjectID  = require('mongodb').ObjectID;

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
    return checkAuthorization();
  }

  trello.getTokenMember(oauth.token, function (err, res, body) {
    if (err) { return next(err); }

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
    if (oauth.authorized) { return next(); }
    notAuthorized();
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

/**
 * Update the history of a platform
 */
exports.updateHistory = function (req, res, next) {
  var cardID = req.params.cid;
  if (!cardID) { return; }

  var fifteenMinutesAgo = new Date(Date.now() - (config.HISTORY.DEBOUNCE_TIME * 1000));

  mongo.get('platforms').findOne({
    cardID: cardID,
    lastModified: { $lt: fifteenMinutesAgo }
  }, function (err, platform) {
    if (err || !platform || !platform.analyses) { return next(err); }

    if (platform.history && deepEqual(platform.analyses, platform.history[0].analyses)) {
      return next();
    }

    mongo.get('platforms').update(
      { _id: platform._id, $or: [
        { 'history.0.date': { $lt: fifteenMinutesAgo } },
        { 'history.0.date': { $exists: false } }
      ]},
      {
        $push: {
          history: {
            $position: 0,
            $each: [{ id: new ObjectID(), date: new Date(), analyses: platform.analyses }]
          }
        }
      },
      next
    );
  });
};
