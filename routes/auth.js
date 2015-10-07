var router = require('express').Router();
var mw     = require('../lib/middlewares.js');

/* Get the Trello profile of the user currently connected */
router.get('/loggedin', mw.updateUserProfile, function (req, res, next) {
  if (!req.session.profile) { return res.status(500).end(); }

  res.status(200).json(req.session.profile);
});

router.get('/logout', function (req, res) {
  req.session = null;
  res.status(204).end();
});

module.exports = router;
