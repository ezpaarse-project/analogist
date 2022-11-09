'use strict'

const config = require('config')
const router = require('express').Router()
const grant = require('grant')
const HttpsProxyAgent = require('https-proxy-agent')

const mw = require('../lib/middlewares')
const trello = require('../lib/trello')
const { sendMail, generateMail } = require('../lib/mailer')

const httpsAgent = process.env.https_proxy && new HttpsProxyAgent(process.env.https_proxy)

router.use('/connect/trello', (req, res, next) => {
  res.locals.grant = {
    dynamic: {
      origin: `${req.protocol}://${req.query.host || req.hostname}`
    }
  }
  next()
})

router.use(grant.express({
  request: {
    timeout: 5000,
    agent: httpsAgent
  },
  config: {
    defaults: {
      callback: '/api/auth/callback',
      transport: 'session',
      prefix: '/api/auth/connect'
    },
    trello: {
      key: config.trello.key,
      secret: config.trello.secret,
      expiration: 'never',
      scope: ['read', 'write', 'account'],
      dynamic: ['origin'],
      custom_params: {
        name: 'AnalogIST'
      }
    }
  }
}))

/**
 * Callback for the Oauth authentication
 * The request is then redirected to the path after /callback/
 */
router.use('/callback', (req, res, next) => {
  const response = req?.session?.grant?.response

  if (response?.error) {
    delete req.session
    return res.status(502).end()
  }

  if (!response) {
    return res.status(502).end()
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

    const sender = config.notifications.sender
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
