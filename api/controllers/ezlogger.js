const config = require('config');
const router = require('express').Router();
const request = require('request');
const { ezpaarse } = require('config');

const ezpaarseUrl = ezpaarse;

router.post('/', (req, res, next) => {
  const { body } = req;

  request({
    method: 'POST',
    url: `${ezpaarseUrl}/`,
    body: body.logs,
    headers: body.headers,
  })
    .on('response', (response) => response.pipe(res))
    .on('error', next);
});

router.get('/version', (req, res, next) => {
  request({
    method: 'GET',
    url: `${ezpaarseUrl}/info/version`,
  })
    .on('response', (response) => response.pipe(res))
    .on('error', next);
});

router.get('/domains/:domain([a-zA-Z0-9-.]+)', (req, res, next) => {
  const { domain } = req.params;

  request({
    method: 'GET',
    url: `${ezpaarseUrl}/info/domains/${domain || ''}`,
  })
    .on('response', (response) => response.pipe(res))
    .on('error', next);
});

router.get('/platforms', (req, res, next) => {
  request({
    method: 'GET',
    url: `${ezpaarseUrl}/info/platforms`,
  })
    .on('response', (response) => response.pipe(res))
    .on('error', next);
});

module.exports = router;
