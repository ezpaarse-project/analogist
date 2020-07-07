const router     = require('express').Router()
const bodyParser = require('body-parser')
const config     = require('config')
const pkg        = require('../package.json')

const apiInfo = JSON.stringify({
  name: pkg.name,
  version: pkg.version,
  boardId: config.trello.boardId
})

router.get('/', (req, res) => {
  res.write(apiInfo)
  res.end()
})

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.use('/platforms', require('./platforms'))
router.use('/trello', require('./trello'))
router.use('/auth', require('./auth'))
router.use('/badges', require('./badges'))
router.use('/certifications', require('./certifications'))

// catch 404 and forward to error handler
router.use((req, res, next) => {
  res.status(404).end()
})

module.exports = router
