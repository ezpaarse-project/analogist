'use strict';

let router = require('express').Router();
let mw     = require('../lib/middlewares.js');
let trello = require('../lib/trello.js');
let mailer = require('../lib/mailer.js');
let config = require('../lib/config');

/* Get the Trello profile of the user currently connected */
router.get('/loggedin', mw.updateUserProfile, (req, res) => {
  if (!req.session.profile) { return res.status(500).end(); }

  res.status(200).json(req.session.profile);
});

router.get('/logout', (req, res) => {
  req.session = null;
  res.status(204).end();
});

router.post('/membership', mw.updateUserProfile, (req, res, next) => {
  if (!req.session.profile) { return res.status(500).end(); }

  trello.getBoard((err, board) => {
    if (err) { return res.status(500).end(); }

    let sender    = config.NOTIFICATIONS.SENDER;
    let receivers = config.NOTIFICATIONS.RECEIVERS;

    if (typeof receivers === 'string') { receivers = receivers.split(','); }

    if (!sender || !receivers || receivers.length === 0) {
      return res.status(501).end();
    }

    let profile = req.session.profile;
    let html = `<a href="https://trello.com/${profile.username}">${profile.fullName}</a>`;
    html += ' souhaite devenir membre du board ';
    html += `<a href="https://trello.com/b/${board.id}">${board.name}</a>`;

    mailer()
    .from(config.NOTIFICATIONS.SENDER)
    .to(config.NOTIFICATIONS.RECEIVERS)
    .subject(`Demande AnalogIST (${profile.fullName})`)
    .html(html)
    .send(err => {
      if (err) { return next(err); }
      res.status(200).end();
    });
  });
});

module.exports = router;
