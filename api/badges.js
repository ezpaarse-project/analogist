'use strict'

const config      = require('config')
const router      = require('express').Router()
const request     = require('request')
const badges      = require('../lib/badges')
const cors        = require('cors')

const url = `http://${config.badges.host}:${config.badges.port}`

router.get('/', (req, res, next) => {
  request.get(`${url}/badges?id=${req.query.id}`)
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

router.get('/metrics/count', cors(), (req, res, next) => {
  request.get(`${url}/metrics/count`)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

router.get('/:type/:uuid/:language', (req, res, next) => {
  const { type, uuid, language } = req.params
  request.get(`${url}/share/${type}/${uuid}/${language}`, {
    headers: {
      angHost: `${req.protocol}://${req.get('x-forwarded-host') || req.connection.remoteAddress}`
    }
  }).on('response', response => {
    res.charset = 'UTF-8'
    res.type('html')
    return response.pipe(res)
  }).on('error', next)
})

router.post('/emit', async (req, res) => {
  const { event, profile } = req.body

  if (!event || !profile) {
    return res.status(400).end()
  }

  try {
    await badges.emit(event, profile, false)
  } catch (err) {
    return res.status(500).end()
  }

  res.status(200).end()
})

router.put('/visibility', (req, res, next) => {
  request.put(`${url}/badges/visibility`, {
    json: {
      visibility: req.body.visibility,
      userId: req.session.profile.id
    }
  }).on('response', response => response.pipe(res))
    .on('error', next)
})

router.get('/users/:badgeId', (req, res, next) => {
  request.get(`${url}/badges/users?id=${req.params.badgeId}`)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

module.exports = router
