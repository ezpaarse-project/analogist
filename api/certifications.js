'use strict'

const router    = require('express').Router()
const config    = require('config')
const mongo     = require('../lib/mongo.js')
const mw        = require('../lib/middlewares.js')
const { sendMail, generateMail } = require('../lib/mailer')

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

    res.status(200).end()
  })
})

/* POST certification request for a platform */
router.post('/:cid', (req, res, next) => {
  const { body: data } = req

  if (!data) return res.status(500).json({ status: 'error' })

  if (data.certification === 'H') {
    delete data.form.values
  }

  return sendMail({
    from: config.notifications.sender,
    to: config.notifications.receivers,
    subject: `[AnalogIST] Mise à jour des certifications de la plateforme : ${data.cardName}`,
    ...generateMail('certifications', { cardName: data.cardName, cardId: data.cardId })
  }).then(() => {
    delete data.cardName

    mongo.get('certifications_history').insert(
      {
        cardId: data.cardId,
        user: data.user,
        certification: data.certification,
        event: 'certification',
        form: data.form,
        status: 'waiting',
        createdAt: new Date()
      },
      (err) => {
        if (err) return res.status(500).json({ status: 'error' })

        return res.status(204).end()
      })
  }).catch(() => res.status(500).json({ status: 'error' }))
})

/* PATCH endorsement for a platform */
router.patch('/endorsement/:cid', (req, res, next) => {
  const { body: data } = req

  if (!data) return res.status(500).json({ status: 'error' })
})

module.exports = router
