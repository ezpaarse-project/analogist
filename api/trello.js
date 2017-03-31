'use strict'

const router = require('express').Router()
const trello = require('../lib/trello.js')
const mw     = require('../lib/middlewares.js')

router.patch('*', mw.authorize)
router.post('*', mw.authorize)

/* GET trello cards */
router.get('/cards', (req, res, next) => {
  trello.getCards().pipe(res)
})

/* GET trello card by ID */
router.get('/cards/:cid', (req, res, next) => {
  trello.getCard(req.params.cid).pipe(res)
})

/* PATCH the card of a platform */
router.patch('/cards/:cid', (req, res, next) => {
  if (typeof req.body !== 'object') { return res.status(400).end() }

  trello.updateCard(req.params.cid, {
    name: req.body.name,
    desc: req.body.desc,
    idList: req.body.idList
  }, req.session.oauth.token).pipe(res)
})

/* Put a user in the members of a card */
router.post('/cards/:cid/members', (req, res, next) => {
  if (typeof req.body !== 'object' || !req.body.id) {
    return res.status(400).end()
  }

  trello.addCardMember(req.params.cid, req.body.id, req.session.oauth.token).pipe(res)
})

/* GET trello cards extended with local data */
router.get('/lists', (req, res, next) => {
  trello.getLists().pipe(res)
})

module.exports = router
