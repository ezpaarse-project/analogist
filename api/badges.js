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

module.exports = router
