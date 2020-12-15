const router = require('express').Router();
const bodyParser = require('body-parser');
const config = require('config');
const pkg = require('../package.json');

router.get('/', (req, res) => res.json({
  name: pkg.name,
  version: pkg.version,
  boardId: config.trello.boardId,
}));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use('/platforms', require('./platforms'));
router.use('/trello', require('./trello'));
router.use('/auth', require('./auth'));
router.use('/badges', require('./badges'));
router.use('/certifications', require('./certifications'));

module.exports = router;
