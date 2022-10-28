'use strict'

const router   = require('express').Router()
const ObjectID = require('mongodb').ObjectID
const request  = require('request')
const config   = require('config')
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
  return mongo.get('certifications')
    .find({ cardID, 'certifications.humanCertified': true, status: 'accepted' })
    .sort({ 'form.year': -1 })
    .toArray()
}

const getPublisherCertifications = (cardID) => {
  return mongo.get('certifications')
    .find({ cardID, 'certifications.publisherCertified': true, status: 'accepted' })
    .sort({ 'form.year': -1 })
    .toArray()
}

router.get('/count', async (req, res, next) => {
  request.get(`${config.ezpaarse}/api/info/platforms/count`)
    .on('response', response => response.pipe(res))
    .on('error', next)
})

/* GET all platforms. */
router.get('/', (req, res, next) => {
  mongo.get('platforms').find().toArray(async (err, docs) => {
    if (err) { return next(err) }

    for (let i = 0; i < docs.length; i += 1) {
      if (docs[i].analyses) {
        docs[i].analyses = docs[i].analyses.length
      }

      try {
        const humanCertifications = await getHumanCertifications(docs[i].cardID)
        if (humanCertifications) {
          docs[i].humanCertifications = humanCertifications
        }
      } catch (e) {
        docs[i].humanCertifications = []
        return res.status(500).json({ error: 'errorCertificationH' })
      }

      try {
        const publisherCertifications = await getPublisherCertifications(docs[i].cardID)
        if (publisherCertifications) {
          docs[i].publisherCertifications = publisherCertifications
        }
      } catch (e) {
        docs[i].publisherCertifications = []
        return res.status(500).json({ error: 'errorCertificationP' })
      }
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
      const humanCertifications = await getHumanCertifications(doc.cardID)
      if (humanCertifications) {
        doc.humanCertifications = humanCertifications
      }
    } catch (e) {
      doc.humanCertifications = []
      return res.status(500).json({ error: 'errorCertificationH' })
    }

    try {
      const publisherCertifications = await getPublisherCertifications(doc.cardID)
      if (publisherCertifications) {
        doc.publisherCertifications = publisherCertifications
      }
    } catch (e) {
      doc.publisherCertifications = []
      return res.status(500).json({ error: 'errorCertificationP' })
    }

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

const sanitizeAnalysis = (req, res, next) => {
  if (req.body.title) {
    req.body.title = req.body.title.trim()
  }
  if (req.body.url) {
    req.body.url = req.body.url.trim()
  }
  if (req.body.unitid) {
    req.body.unitid = req.body.unitid.trim()
  }
  if (req.body.comment) {
    req.body.comment = req.body.comment.trim()
  }
  if (req.body.identifiers && req.body.identifiers.length) {
    req.body.identifiers = req.body.identifiers.map((identifier) => ({
      type: identifier.type ? identifier.type.trim() : null,
      value: identifier.value ? identifier.value.trim() : null
    })).filter((identifier) => identifier.type && identifier.value)
  }
  if (req.body.pathParams && req.body.pathParams.length) {
    req.body.pathParams = req.body.pathParams.map((pathParam) => ({
      value: pathParam.value ? pathParam.value.trim() : null,
      comment: pathParam.comment ? pathParam.comment.trim() : null
    })).filter((pathParams) => pathParams.type && pathParams.comment)
  }
  if (req.body.queryParams && req.body.queryParams.length) {
    req.body.queryParams = req.body.queryParams.map((queryParam) => ({
      name: queryParam.name ? queryParam.name.trim() : null,
      value: queryParam.value ? queryParam.value.trim() : null,
      comment: queryParam.comment ? queryParam.comment.trim() : null
    })).filter((queryParam) => queryParam.name)
  }

  next()
}

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
router.put('/:cid/analyses/:aid', sanitizeAnalysis, mw.updateHistory, (req, res, next) => {
  const analysis = req.body

  if (!ObjectID.isValid(req.params.aid)) { return res.status(400).end() }
  if (typeof analysis !== 'object') { return res.status(400).end() }

  analysis.id = new ObjectID(req.params.aid)
  analysis.updatedAt = new Date()
  analysis.updatedBy = req.session.profile.id

  mongo.get('platforms').findOneAndUpdate(
    { cardID: req.params.cid, 'analyses.id': analysis.id },
    { $set: { 'analyses.$': analysis, lastModified: new Date() } },
    { returnDocument: 'after' },
    (err, result) => {
      if (err) { return next(err) }

      if (config.badges.enabled) {
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
                // eslint-disable-next-line no-console
                .catch((err) => console.error(err))

              badges.emit(config.badges.analysesSilver, req.session.profile, true)
                // eslint-disable-next-line no-console
                .catch((err) => console.error(err))
            }
          )
        }
      }

      res.status(200).json(result.value)
    }
  )
})

/* PATCH the order of analyses */
router.patch('/:cid/analyses/order', mw.updateHistory, (req, res, next) => {
  if (typeof req.body !== 'object') { return res.status(400).end() }

  const order = req.body

  mongo.get('platforms').findOne({ cardID: req.params.cid }, (err, platform) => {
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
      { returnDocument: 'after' },
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

module.exports = router
