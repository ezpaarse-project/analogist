'use strict'

const request   = require('request')
const moment    = require('moment')
const config    = require('config')
const mongo     = require('../lib/mongo.js')
const { sendMail, generateMail } = require('../lib/mailer')
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

async function check (event, userId) {
  if (!event || !userId) { return false }
  if (event.eventName !== 'analyse') { return false }

  let result
  try {
    result = await checkAnalyses(event, userId)
  } catch (err) {
    return false
  }

  return result
}

async function req (event, profile) {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: `http://${config.badges.host}:${config.badges.port}/badges/emit`,
      json: {
        badgeId: event.badgeId,
        recipient: {
          id: profile.id,
          email: profile.email,
          name: profile.fullName
        }
      }
    }, (error, response, body) => {
      if (error) { return reject(error) }
      if (!body || body.status === 'error') {
        return reject(new Error('noData'))
      }

      return resolve(body)
    })
  })
}

exports.emit = async (event, profile, checking) => {
  let isEmittable = true
  if (checking) {
    try {
      isEmittable = await check(event, profile.id)
    } catch (e) {
      return Promise.reject(e)
    }

    if (!isEmittable) {
      return Promise.resolve('isNotEmittable')
    }
  }

  let result
  try {
    result = await req(event, profile)
  } catch (err) { return Promise.reject(err) }

  if (!result) { return Promise.reject(new Error('noDataFound')) }

  const { data, status } = result
  if (!status === 'success') { return Promise.reject(new Error('noDataFound')) }

  if (data === 'BADGE_OWNED' && !checking) {
    io.getIo().to(profile.id).emit('BADGE_ALREADY_OWNED')
    // eslint-disable-next-line new-cap
    return Promise.resolve('alreadyOwned')
  }

  if (data !== 'BADGE_EMITTED') {
    // eslint-disable-next-line new-cap
    return new Promise.reject('noEmitted')
  }

  const issueTime = moment().locale('fr').format('dddd Do MMMM YYYY')

  try {
    sendMail({
      from: config.notifications.sender,
      to: config.notifications.receivers,
      subject: `Émission d'un badge pour ${profile.fullName}`,
      ...generateMail('badges', {
        eventName: event.name,
        fullName: profile.fullName,
        issueTime: issueTime,
        issuer: config.badges.issuer
      })
    })
  } catch (error) {
    return Promise.reject(error)
  }

  io.getIo().to(profile.id).emit(checking ? 'BADGE_EMITTED' : 'BADGE_EMITTED_MANUALLY', { emitted: true })
  // eslint-disable-next-line new-cap
  return Promise.resolve('emitted')
}
