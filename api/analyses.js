'use strict'

const router   = require('express').Router()
const ObjectID = require('mongodb').ObjectID
const mongo    = require('../lib/mongo.js')
const mw       = require('../lib/middlewares.js')

/**
 * Require authorization for all post/put/patch/delete routes
 */
router.post('*', mw.authorize)
router.put('*', mw.authorize)
router.patch('*', mw.authorize)
router.delete('*', mw.authorize)

/* GET the history of a platform. */
router.get('/:aid/history', (req, res, next) => {
  if (!ObjectID.isValid(req.params.aid)) { return res.status(400).end() }

  mongo.get('history')
    .find({ analysisId: new ObjectID(req.params.aid) })
    .sort({ updatedAt: -1 })
    .limit(10)
    .toArray((err, doc) => {
      if (err) { return next(err) }
      if (!doc) { return res.status(404).end() }

      res.status(200).json(doc)
    })
})

/* DELETE an entry in the history */
router.delete('/:aid/history/:hid', (req, res, next) => {
  if (!ObjectID.isValid(req.params.aid)) { return res.status(400).end() }
  if (!ObjectID.isValid(req.params.hid)) { return res.status(400).end() }

  mongo.get('history').deleteOne(
    {
      _id: new ObjectID(req.params.hid),
      analysisId: new ObjectID(req.params.aid)
    },
    (err, result) => {
      if (err) { return next(err) }
      res.status(204).end()
    }
  )
})

module.exports = router
