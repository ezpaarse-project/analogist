'use strict';

let router = require('express').Router();
let mw     = require('../lib/middlewares.js');

/* Get the Trello profile of the user currently connected */
router.get('/loggedin', mw.updateUserProfile, (req, res, next) => {
  if (!req.session.profile) { return res.status(500).end(); }

  res.status(200).json(req.session.profile);
});

router.get('/logout', (req, res) => {
  req.session = null;
  res.status(204).end();
});

module.exports = router;
