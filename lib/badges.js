'use strict'

const request   = require('request')
const moment    = require('moment')
const config    = require('config')
const mongo     = require('../lib/mongo.js')
const mailer    = require('../lib/mailer')
const io        = require('../lib/socket')

function checkAnalyses (event, userId) {
  return new Promise((resolve, reject) => {
    mongo.get('metrics').findOne({ userId }, (err, result) => {
      if (err) return reject(err)

      if (result) {
        const count = result.analyses ? result.analyses.length : 0
        return resolve(count === parseInt(event.criteria))
      }

      resolve(false)
    })
  })
}

function check (event, cardID, userId) {
  if (event && event.eventName === 'analyse') {
    // eslint-disable-next-line
    return checkAnalyses(event, userId).catch((err) => {
      // eslint-disable-next-line
      console.error(err)
      return false
    })
  } else {
    return Promise.resolve(false)
  }
}

exports.emit = async (event, cardID, profile) => {
  const isEmittable = await check(event, cardID, profile.id)

  if (!isEmittable) { return }
  io.getIo().to(profile.id).emit('BADGE_EMITTED', { emitted: true })

  request({
    method: 'POST',
    url: `http://${config.badges.host}:${config.badges.port}/emit`,
    json: {
      badgeId: event.badgeId,
      recipient: {
        id: profile.id,
        email: profile.email,
        name: profile.fullName
      }
    }
  }, (error, response, body) => {
    if (error || body.status === 'error') {
      // eslint-disable-next-line
      return console.error(`Erreur d'emission de badge : ${error}`)
    }

    if (body.status === 'success' && body.data === 'BADGE_EMITTED') {
      io.getIo().to(profile.id).emit('BADGE_EMITTED', { emitted: true })

      const issueTime = moment().format('MMMM Do YYYY, h:mm:ss')
      mailer()
        .from(config.notifications.sender)
        .to(config.notifications.receivers)
        .subject(`Émission d'un badge pour ${profile.fullName}`)
        .html(`Le badge ${event.name} à été attribué à ${profile.fullName} le ${issueTime}.`)
        .send(err => {
          // eslint-disable-next-line
          if (err) console.error(err)
        })
    }
  })
}
