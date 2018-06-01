'use strict'

const request   = require('request')
const config    = require('config')
// const mongo     = require('../lib/mongo.js')

function check (event, userId) {
  return false
}

exports.emit = (event, profile) => {
  if (check(event, profile.id)) {
    request({
      method: 'POST',
      url: `http://${config.badges.host}:${config.badges.port}/emit`,
      json: {
        badgeId: event.badgeId,
        recipient: {
          id: profile.id,
          email: profile.email,
          name: profile.name
        }
      }
    })
  }
}
