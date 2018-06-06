'use strict'

const request   = require('request')
const config    = require('config')
const mongo     = require('../lib/mongo.js')

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

function checkContributions (event, cardID, userId) {
  return new Promise((resolve, reject) => {
    mongo.get('metrics').findOne({ userId }, (err, result) => {
      if (err) reject(err)

      if (result) {
        const count = result.contributions !== undefined ? result.contributions.length : 0

        resolve(count === parseInt(event.criteria))
      }
    })
  })
}

async function check (event, cardID, userId) {
  if (event.name === 'analyse') {
    // eslint-disable-next-line
    return await checkAnalyses(event, cardID, userId).then((res) => {
      return res
    }).catch((err) => {
      // eslint-disable-next-line
      console.log(err)
      return false
    })
  }

  if (event.name === 'contribution') {
    // eslint-disable-next-line
    return await checkContributions(event, cardID, userId).then((res) => {
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
        // eslint-disable-next-line
        console.log('BADGE_EMITTED')
      }
    })
  }
}
