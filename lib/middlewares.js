'use strict';

var deepEqual = require('deep-equal');
var mongo     = require('./mongo.js');
var trello    = require('./trello.js');
var config    = require('./config.js');
var ObjectID  = require('mongodb').ObjectID;

/**
 * Get the profile of the connected user and check authorization
 */
exports.updateUserProfile = function (req, res, next) {
  var oauth = req.session.oauth;

  if (!oauth || !oauth.token || !oauth.secret) {
    return res.status(401).end();
  }

  trello.getTokenMember(oauth.token, function (err, res, body) {
    if (err) { return next(err); }

    var profile;
    try {
      profile = JSON.parse(body);
    } catch (e) {
      return next(e);
    }

    profile.isAuthorized = (profile.idBoards || []).some(id => (id == config.TRELLO.BOARDID));
    profile.lastChecked  = Date.now();

    req.session.profile = profile;

    next();
  });
};

/**
 * Check that the user in the session is a member of the board
 */
exports.authorize = function (req, res, next) {
  if (config.BYPASS) { return next(); }

  var oauth   = req.session.oauth;
  var profile = req.session.profile;

  if (!oauth || !oauth.token || !oauth.secret) {
    return res.status(401).end();
  }

  var thirtyMinutes = 1000 * 60 * 30;

  if (profile.hasOwnProperty('isAuthorized')) {
    if (profile.lastChecked && profile.lastChecked + thirtyMinutes > Date.now()) {
      return profile.isAuthorized ? next() : res.status(403).end();
    }
  }

  exports.updateUserProfile(req, res, function (err) {
    if (err) { return next(err); }
    if (!req.session.profile) { return res.status(500).end(); }

    return req.session.profile.isAuthorized ? next() : res.status(403).end();
  });
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
