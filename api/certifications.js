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
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`)
    }
  })
})

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
  try {
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

    return sendMail({
      from: config.notifications.sender,
      to: config.notifications.receivers,
      subject: `[AnalogIST] Mise à jour des certifications de la plateforme : ${requestData.cardName}`,
      ...generateMail('certifications', { cardName: requestData.cardName, cardId: requestData.cardId })
    }).then(() => {
      delete requestData.cardName

      mongo.get('certifications_history').insertOne(
        {
          cardId: requestData.cardId,
          user: requestData.user,
          certification: requestData.certification,
          event: 'certification',
          form: requestData.form,
          status: 'waiting',
          createdAt: new Date()
        },
        (err) => {
          if (err) return res.status(500).json({ status: 'error' })

          return res.status(204).end()
        })
    }).catch(() => res.status(500).json({ status: 'error' }))
  } catch (e) {
    return res.status(500).json({ status: 'error' })
  }
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

  if (!id) return res.status(500).json({ status: 'error' })

  return mongo.get('certifications_history').findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: 'accepted',
        lastModified: new Date()
      }
    },
    { upsert: true },
    (err) => {
      if (err) {
        return res.status(500).json({ status: 'error' })
      }

      return res.status(200).end()
    })
})

router.post('/:id/refuse', (req, res, next) => {
  const { id } = req.params

  if (!id) return res.status(500).json({ status: 'error' })

  return mongo.get('certifications_history').findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        status: 'refused',
        lastModified: new Date()
      }
    },
    { upsert: true },
    (err) => {
      if (err) {
        return res.status(500).json({ status: 'error' })
      }

      return res.status(200).end()
    })
})

module.exports = router
