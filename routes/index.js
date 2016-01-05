'use strict';

const router = require('express').Router();
const pkg    = require('../package.json');

/* GET a partial view. */
router.get('/partials/:name', (req, res, next) => {
  res.render(`partials/${req.params.name}`, { pkg: pkg });
});

module.exports = router;
