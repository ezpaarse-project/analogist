var router = require('express').Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

/* GET a partial view. */
router.get('/partials/:name', function(req, res, next) {
  res.render('partials/' + req.params.name);
});

module.exports = router;
