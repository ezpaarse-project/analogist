'use strict'

const config = require('config')
const router = require('express').Router()
const Grant  = require('grant-express')
const mw     = require('../lib/middlewares')
const trello = require('../lib/trello')
const { sendMail, generateMail } = require('../lib/mailer')

router.use('/connect/trello', (req, res, next) => {
  req.query.host = req.query.host || req.headers['x-forwarded-host'] || req.headers.host
  next()
})

router.use(new Grant({
  server: {
    protocol: 'http',
    host: `localhost:${config.port}`,
    callback: '/api/auth/callback',
    transport: 'session',
    path: '/api/auth'
  },
  trello: {
    key: config.trello.key,
    secret: config.trello.secret,
    expiration: 'never',
    scope: ['read', 'write', 'account'],
    custom_params: {
      name: 'AnalogIST'
    }
  }
}))

/**
 * Callback for the Oauth authentication
 * The request is then redirected to the path after /callback/
 */
router.use('/callback', (req, res, next) => {
  if (req.query.error) {
    delete req.session
    return res.redirect(req.path)
  }

  const response = req.session.grant && req.session.grant.response

  if (!response) {
    return res.redirect(req.path)
  }

  req.session.oauth = {
    token: response.access_token,
    secret: response.access_secret
  }

  delete req.session.grant
  next()
}, mw.updateUserProfile, (req, res) => {
  res.redirect(req.path)
})

/* Get the Trello profile of the user currently connected */
router.get('/loggedin', mw.updateUserProfile, (req, res) => {
  if (!req.session.profile) { return res.status(500).end() }

  res.status(200).json(req.session.profile)
})

router.get('/logout', (req, res) => {
  req.session = null
  res.status(204).end()
})

router.post('/membership', mw.updateUserProfile, (req, res, next) => {
  if (!req.session.profile) { return res.status(500).end() }

  trello.getBoard((err, board) => {
    if (err) { return res.status(500).end() }

    const sender  = config.notifications.sender
    let receivers = config.notifications.receivers

    if (typeof receivers === 'string') { receivers = receivers.split(',') }

    if (!sender || !receivers || receivers.length === 0) {
      return res.status(501).end()
    }

    const profile = req.session.profile

    return sendMail({
      from: config.notifications.sender,
      to: config.notifications.receivers,
      subject: `Demande AnalogIST (${profile.fullName})`,
      ...generateMail('newUser', {
        fullName: profile.fullName,
        username: profile.username,
        email: profile.email,
        boardId: board.id,
        boardName: board.name
      })
    }).then(() => res.status(204).end())
      .catch(() => res.status(500).json({ status: 'error' }))
  })
})

module.exports = router
