'use strict'

const router    = require('express').Router()
const config    = require('config')
const multer    = require('multer')
const path      = require('path')
const fs        = require('fs')
const ObjectId  = require('mongodb').ObjectID
const mongo     = require('../lib/mongo.js')
const logger     = require('../lib/logger.js')
const mw        = require('../lib/middlewares.js')
const { sendMail, generateMail } = require('../lib/mailer')

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`)
    }
  })
})

const updatePlatform = async (cardId, data) => {
  let currentPlatform
  try {
    currentPlatform = await mongo.get('platforms').findOne({ cardID: cardId })
  } catch (e) { logger.error(e) }

  if (data.year === '—') {
    data.year = null
  }

  const certifications = currentPlatform ? currentPlatform.certifications : { humanCertified: null, publisherCertified: null }
  if (data.certification === 'H') {
    certifications.publisherCertified = currentPlatform ? currentPlatform.certifications.publisherCertified : null
    certifications.humanCertified = data.year
  }

  if (data.certification === 'P') {
    certifications.humanCertified = currentPlatform ? currentPlatform.certifications.humanCertified : null
    certifications.publisherCertified = data.year
  }

  return mongo.get('platforms').findOneAndUpdate(
    { cardID: cardId },
    {
      $set: {
        certifications,
        lastModified: new Date()
      }
    },
    { upsert: true })
}

router.patch('*', mw.authorize)
router.post('*', mw.authorize)

router.get('/', (req, res, next) => {
  return mongo.get('certifications_history').find({ status: 'waiting' }).toArray((err, docs) => {
    if (err) { return next(err) }

    return res.status(200).json(docs || [])
  })
})

/* POST certification request for a platform */
router.post('/:cid', upload.single('attachement'), (req, res, next) => {
  const { body: data } = req
  const { file: attachement } = req

  if (!data) return res.status(500).json({ status: 'error' })

  const requestData = JSON.parse(data.request)

  if (attachement) {
    requestData.form.attachement = attachement.filename
  }

  if (data.certification === 'H') {
    delete data.form.values
  }

  return mongo.get('certifications_history').insertOne(
    {
      cardId: requestData.cardId,
      user: requestData.user,
      certification: requestData.certification,
      event: 'certification',
      form: requestData.form,
      status: req.session.profile.role === 'admin' ? 'accepted' : 'waiting',
      createdAt: new Date()
    },
    async (err) => {
      if (err) return res.status(500).json({ status: 'error' })

      try {
        if (req.session.profile.role !== 'admin') {
          await sendMail({
            from: config.notifications.sender,
            to: config.notifications.receivers,
            subject: `[AnalogIST] Mise à jour des certifications de la plateforme : ${requestData.cardName}`,
            ...generateMail('certifications', {
              cardName: requestData.cardName,
              cardId: requestData.cardId,
              host: req.query.host || req.headers['x-forwarded-host'] || req.headers.host
            })
          })
        }
      } catch (e) { logger.error(e) }

      if (req.session.profile.role === 'admin') {
        try {
          await updatePlatform(requestData.cardId, { certification: requestData.certification, year: requestData.form.year })
        } catch (e) {
          logger.error(e)
          return res.status(500).end()
        }
      }

      return res.status(204).end()
    })
})

/* GET download attachement */
router.get('/download/:attachement', (req, res, next) => {
  const { attachement } = req.params

  const file = fs.readFileSync(path.resolve(__dirname, '..', 'uploads', attachement), 'binary')
  res.setHeader('Content-Length', file.length)
  res.write(file, 'binary')
  res.end()
})

router.post('/:id/accept', (req, res, next) => {
  const { id } = req.params
  const { body: data } = req

  if (!id || !data) return res.status(500).json({ status: 'error' })

  return mongo.get('certifications_history').findOneAndUpdate(
    { _id: new ObjectId(id), status: 'waiting' },
    {
      $set: {
        status: 'accepted',
        lastModified: new Date()
      }
    },
    { upsert: true },
    async (err, doc) => {
      if (err) {
        return res.status(500).json({ status: 'error' })
      }

      try {
        await sendMail({
          from: config.notifications.sender,
          to: doc.value.user.email,
          subject: `[AnalogIST] Acceptation de la certification (${doc.value.certification} - ${doc.value.form.year}) pour la plateforme : ${data.cardName}`,
          ...generateMail('acceptation', {
            host: req.query.host || req.headers['x-forwarded-host'] || req.headers.host,
            cardName: data.cardName,
            cardId: doc.value.cardId,
            certification: doc.value.certification,
            year: doc.value.form.year
          })
        })
      } catch (e) { logger.error(e) }

      try {
        await updatePlatform(doc.value.cardId, { certification: doc.value.certification, year: doc.value.form.year })
      } catch (e) {
        logger.error(e)
        return res.status(500).end()
      }

      return res.status(200).end()
    })
})

router.post('/:id/refuse', (req, res, next) => {
  const { id } = req.params
  const { body: data } = req

  if (!id || !data) return res.status(500).json({ status: 'error' })

  return mongo.get('certifications_history').findOneAndUpdate(
    { _id: new ObjectId(id), status: 'waiting' },
    {
      $set: {
        status: 'refused',
        lastModified: new Date()
      }
    },
    { upsert: true },
    async (err, doc) => {
      if (err) {
        return res.status(500).json({ status: 'error' })
      }

      try {
        await sendMail({
          from: config.notifications.sender,
          to: doc.value.user.email,
          subject: `[AnalogIST] Refus de la certification (${doc.value.certification} - ${doc.value.form.year}) pour la plateforme : ${data.cardName}`,
          ...generateMail('denial', {
            host: req.query.host || req.headers['x-forwarded-host'] || req.headers.host,
            cardName: data.cardName,
            cardId: doc.value.cardId,
            certification: doc.value.certification,
            year: doc.value.form.year,
            comment: data.comment
          })
        })
      } catch (e) { logger.error(e) }

      return res.status(200).end()
    })
})

module.exports = router
