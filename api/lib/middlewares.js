const config = require('config');
const deepEqual = require('deep-equal');
const { ObjectID } = require('mongodb');
const mongo = require('./mongo.js');
const trello = require('./trello.js');

/**
 * Get the profile of the connected user and check authorization
 */
exports.updateUserProfile = function (req, res, next) {
  const { oauth } = req.session;

  if (!oauth || !oauth.token || !oauth.secret) {
    return res.status(401).end();
  }

  trello.getTokenMember(oauth.token, (err, profile) => {
    if (err) { return next(err); }

    trello.getBoardMembers((err, members) => {
      if (err) { return next(err); }

      profile.isAuthorized = members.some((m) => (m.id === profile.id));
      profile.lastChecked = Date.now();

      req.session.profile = profile;

      trello.getBoardAdmins(oauth.token, (err, members) => {
        if (err) { return next(err); }

        const role = members.find((member) => member.idMember === profile.id);
        if (role) req.session.profile.role = role.memberType;

        next();
      });
    });
  });
};

/**
 * Check that the user in the session is a member of the board
 */
exports.authorize = function (req, res, next) {
  if (config.bypass) {
    req.session.profile = { id: 'somerandomid' };
    return next();
  }

  const { oauth } = req.session;
  const { profile } = req.session;

  if (!oauth || !oauth.token || !oauth.secret) {
    return res.status(401).end();
  }

  const thirtyMinutes = 1000 * 60 * 30;

  if (Object.prototype.hasOwnProperty.call(profile, 'isAuthorized')) {
    if (profile.lastChecked && profile.lastChecked + thirtyMinutes > Date.now()) {
      return profile.isAuthorized ? next() : res.status(403).end();
    }
  }

  exports.updateUserProfile(req, res, (err) => {
    if (err) { return next(err); }
    if (!req.session.profile) { return res.status(500).end(); }

    return req.session.profile.isAuthorized ? next() : res.status(403).end();
  });
};

/**
 * Update the history of a platform
 */
exports.updateHistory = function (req, res, next) {
  const cardID = req.params.cid;
  if (!cardID) { return; }

  const fifteenMinutesAgo = new Date(Date.now() - (config.history.debounceTime * 1000));

  mongo.get('platforms').findOne({
    cardID,
    lastModified: { $lt: fifteenMinutesAgo },
  }, (err, platform) => {
    if (err || !platform || !platform.analyses) { return next(err); }

    if (platform.history && deepEqual(platform.analyses, platform.history[0].analyses)) {
      return next();
    }

    mongo.get('platforms').updateOne(
      {
        _id: platform._id,
        $or: [
          { 'history.0.date': { $lt: fifteenMinutesAgo } },
          { 'history.0.date': { $exists: false } },
        ],
      },
      {
        $push: {
          history: {
            $position: 0,
            $each: [{ id: new ObjectID(), date: new Date(), analyses: platform.analyses }],
          },
        },
      },
      next,
    );
  });
};
