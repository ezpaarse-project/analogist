'use strict';

let router = require('express').Router();
let trello = require('../lib/trello.js');
let mw     = require('../lib/middlewares.js');

router.patch('*', mw.authorize);

/* GET trello cards extended with local data */
router.get('/cards', (req, res, next) => {
  trello.getCards().pipe(res);
});

/* PATCH the card of a platform */
router.patch('/cards/:cid', (req, res, next) => {
  if (typeof req.body !== 'object') { return res.status(400).end(); }

  trello.updateCard(req.params.cid, {
    desc: req.body.desc,
    idList: req.body.idList
  }, req.session.oauth.token).pipe(res);
});

/* GET trello cards extended with local data */
router.get('/lists', (req, res, next) => {
  trello.getLists().pipe(res);
});

module.exports = router;
