var router = require('express').Router();

/* GET a partial view. */
router.get('/partials/:name', (req, res, next) => {
  res.render(`partials/${req.params.name}`);
});

module.exports = router;
