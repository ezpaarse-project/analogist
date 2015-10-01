/* global describe, it */
"use strict";

process.env.NODE_ENV = 'production';

var request = require('supertest');
var expect  = require('chai').expect;

var config  = require('../lib/config.js');
var mongo   = require('../lib/mongo.js');
var app;

config.BYPASS = true;
config.HISTORY.DEBOUNCE_TIME = 0;

var mongoUrl = `mongodb://${config.MONGO.ADDRESS}:${config.MONGO.PORT}/test`;

var cardID = 'sd123';
var analysisID;
var historyID;

/**
 * Tests a complete scenario involving sequences of requests
 */
describe('Routes', function () {
  before(function (done) {
    mongo.connect(mongoUrl, function (err) {
      if (err) { throw err; }

      app = require('../app.js');
      mongo.db.dropDatabase(done);
    });
  });

  it(`GET    /api/platforms/${cardID}`, function (done) {
    request(app)
    .get(`/api/platforms/${cardID}`)
    .expect(404)
    .end(done);
  });

  it(`GET    /api/platforms/${cardID}/analyses`, function (done) {
    request(app)
    .get(`/api/platforms/${cardID}/analyses`)
    .expect(404)
    .end(done);
  });

  it(`POST   /api/platforms/${cardID}/analyses`, function (done) {
    request(app)
    .post(`/api/platforms/${cardID}/analyses`)
    .send({ foo: 'bar' })
    .expect('Content-Type', /json/)
    .expect(201)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('object');
      expect(body).to.have.property('id').that.is.a('string');
      expect(body).to.have.property('foo', 'bar');

      analysisID = body.id;
    })
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        if (err) { throw err; }

        expect(doc).to.exist;
        expect(doc).to.have.property('cardID', cardID);
        expect(doc).to.have.property('analyses').that.is.an('array').with.length(1);

        var analysis = doc.analyses[0];
        expect(analysis).to.have.property('foo', 'bar');
        expect(analysis).to.have.property('id').that.is.an('object');
        expect(analysis.id.toString()).to.equal(analysisID);

        done();
      });
    });
  });

  it(`PUT    /api/platforms/${cardID}/analyses/:id`, function (done) {
    expect(analysisID).to.exist;

    request(app)
    .put(`/api/platforms/${cardID}/analyses/${analysisID}`)
    .send({ bar: 'foo' })
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('object');
      expect(body).to.have.property('cardID', cardID);
      expect(body).to.have.property('analyses').that.is.an('array').with.length(1);

      var analysis = body.analyses[0];
      expect(analysis).to.have.property('id', analysisID);
      expect(analysis).to.have.property('bar', 'foo');
    })
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        if (err) { throw err; }

        expect(doc).to.exist;
        expect(doc.cardID).to.equal(cardID);
        expect(doc).to.have.property('analyses').that.is.an('array').with.length(1);

        var analysis = doc.analyses[0];
        expect(analysis).to.have.property('bar', 'foo');
        expect(analysis).to.have.property('id').that.is.an('object');
        expect(analysis.id.toString()).to.equal(analysisID);

        done();
      });
    });
  });

  it(`GET    /api/platforms/${cardID}`, function (done) {
    request(app)
    .get(`/api/platforms/${cardID}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('object');
      expect(body).to.have.property('cardID', cardID);
      expect(body).to.have.property('analyses').that.is.an('array').with.length(1);
      expect(body.analyses[0]).to.have.property('bar', 'foo');
    })
    .end(done);
  });

  it(`GET    /api/platforms/${cardID}/analyses`, function (done) {
    request(app)
    .get(`/api/platforms/${cardID}/analyses`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('array').with.length(1);
      expect(body[0]).to.have.property('bar', 'foo');
    })
    .end(done);
  });

  it(`DELETE /api/platforms/${cardID}/analyses/:id`, function (done) {
    expect(analysisID).to.exist;

    request(app)
    .delete(`/api/platforms/${cardID}/analyses/${analysisID}`)
    .expect(204)
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        if (err) { throw err; }

        expect(doc).to.exist;
        expect(doc).to.have.property('analyses').that.is.an('array').with.length(0);

        done();
      });
    });
  });

  it(`GET    /api/platforms/${cardID}/history`, function (done) {
    request(app)
    .get(`/api/platforms/${cardID}/history`)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('array').with.length(2);
      expect(body[0]).to.have.property('analyses').that.is.an('array').with.length(1);
      expect(body[1]).to.have.property('analyses').that.is.an('array').with.length(1);

      expect(body[0]).to.have.property('date');
      expect(body[1]).to.have.property('date');

      var date1 = new Date(body[0].date);
      var date2 = new Date(body[1].date);
      expect(date1.getTime()).to.be.above(date2.getTime());

      expect(body[1].analyses[0]).to.have.property('foo', 'bar'); // was inserted with foo:bar
      expect(body[0].analyses[0]).to.have.property('bar', 'foo'); // then updated with bar:foo

      historyID = body[1].id;
    })
    .end(done);
  });

  it(`POST   /api/platforms/${cardID}/history/:id`, function (done) {
    request(app)
    .post(`/api/platforms/${cardID}/history/${historyID}`)
    .expect(204)
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        if (err) { throw err; }

        expect(doc).to.have.property('analyses').that.is.an('array').with.length(1);
        expect(doc).to.have.property('history').that.is.an('array').with.length(3);

        expect(doc.analyses[0]).to.have.property('foo', 'bar');

        expect(doc.history[0]).to.have.property('analyses').that.is.an('array').with.length(0);
        expect(doc.history[1]).to.have.property('analyses').that.is.an('array').with.length(1);
        expect(doc.history[2]).to.have.property('analyses').that.is.an('array').with.length(1);

        expect(doc.history[1].analyses[0]).to.have.property('bar', 'foo');
        expect(doc.history[2].analyses[0]).to.have.property('foo', 'bar');

        done();
      });
    });
  });

  it(`DELETE /api/platforms/${cardID}/history/:id`, function (done) {
    request(app)
    .delete(`/api/platforms/${cardID}/history/${historyID}`)
    .expect(204)
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        if (err) { throw err; }

        expect(doc).to.have.property('history').that.is.an('array').with.length(2);

        expect(doc.history[0]).to.have.property('analyses').that.is.an('array').with.length(0);
        expect(doc.history[1]).to.have.property('analyses').that.is.an('array').with.length(1);

        expect(doc.history[1].analyses[0]).to.have.property('bar', 'foo');

        done();
      });
    });
  });

  it(`DELETE /api/platforms/${cardID}`, function (done) {
    request(app)
    .delete(`/api/platforms/${cardID}`)
    .expect(204)
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        if (err) { throw err; }

        expect(doc).to.not.exist;
        done();
      });
    });
  });
});