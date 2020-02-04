'use strict'

const router    = require('express').Router()
const config    = require('config')
const multer    = require('multer')
const path      = require('path')
const fs        = require('fs')
const ObjectId  = require('mongodb').ObjectID
const mongo     = require('../lib/mongo.js')
const mw        = require('../lib/middlewares.js')
const { sendMail, generateMail } = require('../lib/mailer')

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file) {
        cb(null, 'uploads/')
      }
    },
    filename: (req, file, cb) => {
      if (file) {
        cb(null, `${Date.now()}_${file.originalname}`)
      }
    }
  })
})

router.patch('*', mw.authorize)
router.post('*', mw.authorize)

router.get('/', (req, res, next) => {
  return mongo.get('certifications').find().toArray((err, docs) => {
    if (err) { return next(err) }

    return res.status(200).json(docs || [])
  })
})

/* POST certification request for a platform */
router.post('/:cid', upload.single('attachment'), (req, res, next) => {
  const { body: data } = req
  const { file: attachment } = req

  if (!data) return res.status(500).json({ status: 'error' })

  if (attachment) {
    data.form.attachment = attachment.filename
  }

  return mongo.get('certifications').insertOne(
    {
      cardID: data.cardID,
      user: {
        userId: req.session.profile.id,
        fullName: req.session.profile.fullName,
        email: req.session.profile.email
      },
      certifications: JSON.parse(data.certifications),
      form: JSON.parse(data.form),
      status: req.session.profile.role === 'admin' ? 'accepted' : 'waiting',
      createdAt: new Date()
    },
    (err) => {
      if (err) return res.status(500).json({ status: 'error' })

      if (req.session.profile.role !== 'admin') {
        sendMail({
          from: config.notifications.sender,
          to: config.notifications.receivers,
          subject: `[AnalogIST] Mise à jour des certifications de la plateforme : ${data.cardName}`,
          ...generateMail('certifications', {
            cardName: data.cardName,
            cardID: data.cardID,
            host: req.query.host || req.headers['x-forwarded-host'] || req.headers.host
          })
        })
      }

      return res.status(204).end()
    })
})

/* GET download attachment */
router.get('/download/:attachment', (req, res, next) => {
  const { attachment } = req.params

  if (!attachment) return res.status(404)

  return fs.createReadStream(path.resolve(__dirname, '..', 'uploads', attachment)).pipe(res)
})

router.post('/:id/accept', (req, res, next) => {
  const { id } = req.params
  const { body: data } = req

  if (!id || !ObjectId.isValid(id) || !data) return res.status(400).json({ status: 'error' })

  return mongo.get('certifications').findOneAndUpdate(
    { _id: new ObjectId(id), status: 'waiting' },
    {
      $set: {
        status: 'accepted',
        lastModified: new Date()
      }
    },
    { upsert: true },
    (err, doc) => {
      if (err) {
        return res.status(500).json({ status: 'error' })
      }

      sendMail({
        from: config.notifications.sender,
        to: doc.value.user.email,
        subject: `[AnalogIST] Acceptation de la certification (${doc.value.certification} - ${doc.value.form.year}) pour la plateforme : ${data.cardName}`,
        ...generateMail('acceptation', {
          host: req.query.host || req.headers['x-forwarded-host'] || req.headers.host,
          cardName: data.cardName,
          cardID: doc.value.cardID,
          certification: doc.value.certification,
          year: doc.value.form.year
        })
      })

      return res.status(200).end()
    })
})

router.post('/:id/refuse', (req, res, next) => {
  const { id } = req.params
  const { body: data } = req

  if (!id || !ObjectId.isValid(id) || !data) return res.status(400).json({ status: 'error' })

  return mongo.get('certifications').findOneAndUpdate(
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

      sendMail({
        from: config.notifications.sender,
        to: doc.value.user.email,
        subject: `[AnalogIST] Refus de la certification (${doc.value.certification} - ${doc.value.form.year}) pour la plateforme : ${data.cardName}`,
        ...generateMail('denial', {
          host: req.query.host || req.headers['x-forwarded-host'] || req.headers.host,
          cardName: data.cardName,
          cardID: doc.value.cardID,
          certification: doc.value.certification,
          year: doc.value.form.year,
          comment: data.comment
        })
      })

      return res.status(200).end()
    })
})

module.exports = router
