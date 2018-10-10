'use strict'

const config      = require('config')
const router      = require('express').Router()
const request     = require('request')
const badges      = require('../lib/badges')
const cors        = require('cors')

const url = `http://${config.badges.host}:${config.badges.port}`

router.get('/', (req, res, next) => {
  request.get(`${url}/badges?id=${req.session.profile.id}`)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

router.get('/ping', (req, res, next) => {
  request.get(`${url}/ping`)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

router.get('/metrics', cors(), (req, res, next) => {
  request.get(`${url}/metrics`)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

router.get('/view/:userId/:badgeId/:language', (req, res, next) => {
  request.get(`${url}/view?u=${req.params.userId}&b=${req.params.badgeId}&l=${req.params.language}`, {
    headers: {
      'angHost': `${req.protocol}://${req.get('x-forwarded-host') || req.connection.remoteAddress}`
    }
  }).on('response', response => response.pipe(res))
    .on('error', next)
})

router.get('/embed/:userId/:badgeId/:language', (req, res, next) => {
  request.get(`${url}/embed?u=${req.params.userId}&b=${req.params.badgeId}&l=${req.params.language}`, {
    headers: {
      'angHost': `${req.protocol}://${req.get('x-forwarded-host') || req.connection.remoteAddress}`
    }
  }).on('response', response => response.pipe(res))
    .on('error', next)
})

router.post('/emit', (req, res) => {
  badges.emit(req.body.event, req.body.profile, false)
})

router.put('/visibility', (req, res, next) => {
  request.put(`${url}/visibility`, {
    json: {
      visibility: req.body.visibility,
      userId: req.session.profile.id
    }
  }).on('response', response => response.pipe(res))
    .on('error', next)
})

module.exports = router
