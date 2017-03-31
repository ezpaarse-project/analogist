'use strict'

const router   = require('express').Router()
const ObjectID = require('mongodb').ObjectID
const trello   = require('../lib/trello.js')
const mongo    = require('../lib/mongo.js')
const mw       = require('../lib/middlewares.js')

/**
 * Require authorization for all post/put/patch/delete routes
 */
router.post('*', mw.authorize)
router.put('*', mw.authorize)
router.patch('*', mw.authorize)
router.delete('*', mw.authorize)

/* GET all platforms. */
router.get('/', (req, res, next) => {
  mongo.get('platforms').find().toArray((err, docs) => {
    if (err) { return next(err) }

    res.status(200).json(docs || [])
  })
})

/* GET a platform. */
router.get('/:cid', (req, res, next) => {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, (err, doc) => {
    if (err) { return next(err) }
    if (!doc) { return res.status(404).end() }

    res.status(200).json(doc)
  })
})

/* CREATE a platform (ie. card on Trello) */
router.post('/', (req, res, next) => {
  const card = req.body

  if (typeof card !== 'object') {
    return res.status(400).end('no card given')
  } else if (!card.idList || !card.name) {
    return res.status(400).end('missing mandatory field')
  }
  card.due = card.due || null
  card.lastModified = new Date()
  card.idMembers = [req.session.profile.id]

  trello.createCard(card, req.session.oauth.token).pipe(res)
})

/* DELETE a platform */
router.delete('/:cid', (req, res, next) => {
  mongo.get('platforms').remove({ cardID: req.params.cid }, (err, result) => {
    if (err) { return next(err) }
    res.status(204).end()
  })
})

/* GET the analyses of a platform. */
router.get('/:cid/analyses', (req, res, next) => {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, { analyses: 1 }, (err, doc) => {
    if (err) { return next(err) }
    if (!doc) { return res.status(404).end() }

    res.status(200).json(doc.analyses || [])
  })
})

/* GET the history of a platform. */
router.get('/:cid/history', (req, res, next) => {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, { history: 1 }, (err, doc) => {
    if (err) { return next(err) }
    if (!doc) { return res.status(404).end() }

    res.status(200).json(doc.history || [])
  })
})

/* PATCH the platform comment. */
router.patch('/:cid/comment', (req, res, next) => {
  if (typeof req.body !== 'object') { return res.status(400).end() }

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid },
    {
      $set: {
        comment: req.body.text,
        lastModified: new Date()
      }
    },
    { upsert: true },
    (err, result) => {
      if (err) { return next(err) }
      res.status(201).json(req.body)
    }
  )
})

/* POST new analysis. */
router.post('/:cid/analyses', mw.updateHistory, (req, res, next) => {
  if (typeof req.body !== 'object') { return res.status(400).end() }

  req.body.id = new ObjectID()

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid },
    {
      $push: { analyses: req.body },
      $set: { lastModified: new Date() }
    },
    { upsert: true },
    (err, result) => {
      if (err) { return next(err) }
      res.status(201).json(req.body)
    }
  )
})

/* PUT an existing analysis */
router.put('/:cid/analyses/:aid', mw.updateHistory, (req, res, next) => {
  if (typeof req.body !== 'object') { return res.status(400).end() }
  if (!ObjectID.isValid(req.params.aid)) { return res.status(400).end() }

  req.body.id = new ObjectID(req.params.aid)

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid, 'analyses.id': req.body.id },
    { $set: { 'analyses.$': req.body, lastModified: new Date() } },
    { returnOriginal: false },
    (err, result) => {
      if (err) { return next(err) }
      res.status(200).json(result.value)
    }
  )
})

/* DELETE an analysis */
router.delete('/:cid/analyses/:aid', mw.updateHistory, (req, res, next) => {
  if (!ObjectID.isValid(req.params.aid)) { return res.status(400).end() }

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid },
    {
      $pull: { analyses: { id: new ObjectID(req.params.aid) } },
      $set: { lastModified: new Date() }
    },
    (err, result) => {
      if (err) { return next(err) }
      res.status(204).end()
    }
  )
})

/* DELETE an entry in the history */
router.delete('/:cid/history/:hid', (req, res, next) => {
  if (!ObjectID.isValid(req.params.hid)) { return res.status(400).end() }

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid },
    { $pull: { history: { id: new ObjectID(req.params.hid) } } },
    (err, result) => {
      if (err) { return next(err) }
      res.status(204).end()
    }
  )
})

/* POST an entry in the history, ie. restore the analyses to this point */
router.post('/:cid/history/:hid', (req, res, next) => {
  if (!ObjectID.isValid(req.params.hid)) { return res.status(400).end() }

  mongo.get('platforms').findOne(
    { cardID: req.params.cid, 'history.id': new ObjectID(req.params.hid) },
    { 'history.$': 1, 'analyses': 1 },
    (err, platform) => {
      if (err) { return next(err) }
      if (!platform) { return res.status(404).end() }

      if (!Array.isArray(platform.history) || !platform.history[0]) {
        return res.status(500).end()
      }

      mongo.get('platforms').findOneAndUpdate(
        { _id: platform._id },
        {
          $set: { analyses: platform.history[0].analyses },
          $push: {
            history: {
              $position: 0,
              $each: [{ id: new ObjectID(), date: new Date(), analyses: platform.analyses }]
            }
          }
        },
        (err) => {
          if (err) { return next(err) }
          res.status(204).end()
        }
      )
    }
  )
})

module.exports = router
