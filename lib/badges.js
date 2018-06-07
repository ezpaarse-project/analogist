'use strict'

const request   = require('request')
const moment    = require('moment')
const config    = require('config')
const mongo     = require('../lib/mongo.js')
const mailer    = require('../lib/mailer')

function checkAnalyses (event, cardID, userId) {
  return new Promise((resolve, reject) => {
    mongo.get('metrics').findOne({ userId }, (err, result) => {
      if (err) reject(err)

      if (result) {
        const count = result.analyses !== undefined ? result.analyses.length : 0

        resolve(count === parseInt(event.criteria))
      }
    })
  })
}

async function check (event, cardID, userId) {
  if (event.eventName && event.eventName === 'analyse') {
    // eslint-disable-next-line
    return await checkAnalyses(event, cardID, userId).then((res) => {
      return res
    }).catch((err) => {
      // eslint-disable-next-line
      console.log(err)
      return false
    })
  }
}

exports.emit = async (event, cardID, profile) => {
  const isEmittable = await check(event, cardID, profile.id)

  if (isEmittable) {
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
      if (error || body.status === 'error') throw error

      if (body.status === 'success' && body.data === 'BADGE_EMITTED') {
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

        // eslint-disable-next-line
        console.log(body.data)
      }
    })
  }
}
