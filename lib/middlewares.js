'use strict'

const config    = require('config')
const deepEqual = require('deep-equal')
const mongo     = require('./mongo.js')
const trello    = require('./trello.js')
const ObjectID  = require('mongodb').ObjectID

/**
 * Get the profile of the connected user and check authorization
 */
exports.updateUserProfile = function (req, res, next) {
  const oauth = req.session.oauth

  if (!oauth || !oauth.token || !oauth.secret) {
    return res.status(401).end()
  }

  trello.getTokenMember(oauth.token, (err, profile) => {
    if (err) { return next(err) }

    trello.getBoardMembers((err, members) => {
      if (err) { return next(err) }

      profile.isAuthorized = members.some(m => (m.id === profile.id))
      profile.lastChecked = Date.now()

      req.session.profile = profile

      trello.getBoardAdmins(oauth.token, (err, members) => {
        if (err) { return next(err) }

        const role = members.find(member => { return member.idMember === profile.id })
        if (role) req.session.profile.role = role.memberType

        next()
      })
    })
  })
}

/**
 * Check that the user in the session is a member of the board
 */
exports.authorize = function (req, res, next) {
  if (config.bypass) {
    req.session.profile = { id: 'somerandomid' }
    return next()
  }

  const oauth   = req.session.oauth
  const profile = req.session.profile

  if (!oauth || !oauth.token || !oauth.secret) {
    return res.status(401).end()
  }

  const thirtyMinutes = 1000 * 60 * 30

  if (Object.prototype.hasOwnProperty.call(profile, 'isAuthorized')) {
    if (profile.lastChecked && profile.lastChecked + thirtyMinutes > Date.now()) {
      return profile.isAuthorized ? next() : res.status(403).end()
    }
  }

  exports.updateUserProfile(req, res, (err) => {
    if (err) { return next(err) }
    if (!req.session.profile) { return res.status(500).end() }

    return req.session.profile.isAuthorized ? next() : res.status(403).end()
  })
}

/**
 * Update the history of a platform
 */
exports.updateHistory = function (req, res, next) {
  const cardID = req.params.cid
  if (!cardID) { return }

  const fifteenMinutesAgo = new Date(Date.now() - (config.history.debounceTime * 1000))

  mongo.get('platforms').findOne({
    cardID: cardID,
    lastModified: { $lt: fifteenMinutesAgo }
  }, (err, platform) => {
    if (err || !platform || !platform.analyses || !platform.analyses.length) { return next(err) }

    mongo.get('history').find({
      analysisId: platform.analyses[0].id
    }).sort({ updatedAt: -1 }).toArray((err, history) => {
      if (err || !history) { return next(err) }

      const lastHistory = history[0]

      if (lastHistory && deepEqual(platform.analyses, lastHistory)) {
        return next()
      }
    })

    const analysis = Object.assign({}, platform.analyses[0])

    analysis.analysisId = analysis.id
    delete analysis.id

    mongo.get('history').findOneAndUpdate(
      {
        ...analysis,
        _id: new ObjectID()
      },
      {
        $set: {
          lastModified: new Date()
        }
      },
      { upsert: true },
      (err, doc) => {
        if (err || !doc) { return next(err) }

        return next()
      }
    )
  })
}
