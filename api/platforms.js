'use strict'

const router   = require('express').Router()
const ObjectID = require('mongodb').ObjectID
const request  = require('request')
const config  = require('config')
const trello   = require('../lib/trello.js')
const mongo    = require('../lib/mongo.js')
const mw       = require('../lib/middlewares.js')
const badges   = require('../lib/badges.js')

/**
 * Require authorization for all post/put/patch/delete routes
 */
router.post('*', mw.authorize)
router.put('*', mw.authorize)
router.patch('*', mw.authorize)
router.delete('*', mw.authorize)

/* GET rtype/mime/rid fields. */
router.get('/fields.json', (req, res, next) => {
  const fieldsUrl = 'http://raw.githubusercontent.com/ezpaarse-project/ezpaarse-platforms/master/fields.json'
  request.get(fieldsUrl)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

const getHumanCertifications = (cardID) => {
  return mongo.get('certifications').find({ cardID, 'certifications.humanCertified': true }).sort({ 'form.year': -1 }).toArray()
}

const getPublisherCertifications = (cardID) => {
  return mongo.get('certifications').find({ cardID, 'certifications.publisherCertified': true }).sort({ 'form.year': -1 }).toArray()
}

/* GET all platforms. */
router.get('/', (req, res, next) => {
  mongo.get('platforms').find().toArray(async (err, docs) => {
    if (err) { return next(err) }

    for (let i = 0; i < docs.length; i += 1) {
      try {
        const humanCertifications = await getHumanCertifications(docs[i].cardID).then(res => res)
        if (humanCertifications) {
          docs[i].humanCertifications = humanCertifications
        }

        const publisherCertifications = await getPublisherCertifications(docs[i].cardID).then(res => res)
        if (publisherCertifications) {
          docs[i].publisherCertifications = publisherCertifications
        }
      } catch (e) { }
    }

    res.status(200).json(docs || [])
  })
})

/* GET a platform. */
router.get('/:cid', (req, res, next) => {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, async (err, doc) => {
    if (err) { return next(err) }
    if (!doc) { return res.status(404).end() }

    try {
      const humanCertifications = await getHumanCertifications(doc.cardID).then(res => res)
      if (humanCertifications) {
        doc.humanCertifications = humanCertifications
      }

      const publisherCertifications = await getPublisherCertifications(doc.cardID).then(res => res)
      if (publisherCertifications) {
        doc.publisherCertifications = publisherCertifications
      }
    } catch (e) { }

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

  trello.createCard(card, req.session.oauth.token)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

/* DELETE a platform */
router.delete('/:cid', (req, res, next) => {
  trello.closeCard(req.params.cid, req.session.oauth.token)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

/* PATCH a platform */
router.patch('/:cid', (req, res, next) => {
  trello.uncloseCard(req.params.cid, req.session.oauth.token)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

/* GET the analyses of a platform. */
router.get('/:cid/analyses', (req, res, next) => {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, { projection: { analyses: 1 } }, (err, doc) => {
    if (err) { return next(err) }
    if (!doc) { return res.status(404).end() }

    res.status(200).json(doc.analyses || [])
  })
})

/* GET the history of a platform. */
router.get('/:cid/history', (req, res, next) => {
  mongo.get('platforms').findOne({ cardID: req.params.cid }, { projection: { history: 1 } }, (err, doc) => {
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
  const analysis = req.body

  if (typeof analysis !== 'object') { return res.status(400).end() }

  analysis.id = new ObjectID()
  analysis.updatedAt = new Date()
  analysis.updatedBy = req.session.profile.id

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid },
    {
      $push: { analyses: analysis },
      $set: { lastModified: new Date() }
    },
    { upsert: true },
    (err, result) => {
      if (err) { return next(err) }

      res.status(201).json(analysis)
    }
  )
})

/* PUT an existing analysis */
router.put('/:cid/analyses/:aid', mw.updateHistory, (req, res, next) => {
  const analysis = req.body

  if (!ObjectID.isValid(req.params.aid)) { return res.status(400).end() }
  if (typeof analysis !== 'object') { return res.status(400).end() }

  analysis.id = new ObjectID(req.params.aid)
  analysis.updatedAt = new Date()
  analysis.updatedBy = req.session.profile.id

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid, 'analyses.id': analysis.id },
    { $set: { 'analyses.$': analysis, lastModified: new Date() } },
    { returnOriginal: false },
    (err, result) => {
      if (err) { return next(err) }

      if (analysis.url && analysis.url.length > 0) {
        mongo.get('metrics').findOneAndUpdate(
          { userId: req.session.profile.id },
          {
            $addToSet: { analyses: analysis.id },
            $set: { lastModified: new Date() }
          },
          { upsert: true },
          (err, result) => {
            // eslint-disable-next-line
            if (err) console.error(err)

            badges.emit(config.badges.analysesBronze, req.session.profile, true)
            badges.emit(config.badges.analysesSilver, req.session.profile, true)
          }
        )
      }

      res.status(200).json(result.value)
    }
  )
})

/* PATCH the order of analyses */
router.patch('/:cid/analyses/order', mw.updateHistory, (req, res, next) => {
  if (typeof req.body !== 'object') { return res.status(400).end() }

  const order = req.body

  mongo.get('platforms').findOne({ 'cardID': req.params.cid }, (err, platform) => {
    if (err) { return next(err) }
    if (!platform) { return res.status(404).end() }

    const changes = {}

    platform.analyses.forEach((analysis, i) => {
      if (!isNaN(order[analysis.id])) {
        changes[`analyses.${i}.order`] = order[analysis.id]
      }
    })

    if (Object.keys(changes).length === 0) {
      return res.status(200).json(platform)
    }

    changes.lastModified = new Date()

    mongo.get('platforms').findOneAndUpdate(
      { cardID: req.params.cid },
      { $set: changes },
      { returnOriginal: false },
      (err, result) => {
        if (err) { return next(err) }

        res.status(200).json(result.value)
      }
    )
  })
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
    { projection: { 'history.$': 1, 'analyses': 1 } },
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
