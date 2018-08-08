'use strict'

const config = require('config')
const router = require('express').Router()
const request  = require('request')

const url = `http://${config.badges.host}:${config.badges.port}`

router.get('/', (req, res) => {
  request.get(`${url}/badges?id=${req.session.profile.id}`).pipe(res)
})

router.get('/ping', (req, res) => {
  request.get(`${url}/ping`).pipe(res)
})

router.get('/view/:userId/:badgeId/:language', (req, res) => {
  request.get(`${url}/view?u=${req.params.userId}&b=${req.params.badgeId}&l=${req.params.language}`, {
    headers: {
      'angHost': `${req.protocol}://${req.get('x-forwarded-host') || req.connection.remoteAddress}`
    }
  }).pipe(res)
})

router.get('/embed/:userId/:badgeId/:language', (req, res) => {
  request.get(`${url}/embed?u=${req.params.userId}&b=${req.params.badgeId}&l=${req.params.language}`, {
    headers: {
      'angHost': `${req.protocol}://${req.get('x-forwarded-host') || req.connection.remoteAddress}`
    }
  }).pipe(res)
})

module.exports = router
