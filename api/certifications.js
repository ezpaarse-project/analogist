'use strict'

const router = require('express').Router()
const mongo  = require('../lib/mongo.js')
const mw     = require('../lib/middlewares.js')

router.patch('*', mw.authorize)
router.post('*', mw.authorize)

router.get('/:cid', (req, res, next) => {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, (err, doc) => {
    if (err) { return next(err) }
    if (!doc) { return res.status(200).json({ humanCertified: null, publisherCertified: null }) }

    res.status(200).json(doc.certifications)
  })
})

/* PATCH certifications of a platform */
router.patch('/:cid', (req, res, next) => {
  mongo.get('platforms').findOneAndUpdate({ cardID: req.params.cid }, {
    $set: {
      certifications: req.body.certifications,
      lastModified: new Date()
    }
  },
  { upsert: true },
  (err, doc) => {
    if (err) return res.status(500).json({ status: 'error' })

    res.status(200).json(doc.value)
  })
})

module.exports = router
