/* global describe, it */
"use strict";

process.env.NODE_ENV = 'production';

var request = require('supertest');
var expect  = require('chai').expect;

var config  = require('../config.json');
var mongo   = require('../lib/mongo.js');
var app     = require('../app.js');

var mongoUrl = 'mongodb://' + config.MONGO.ADDRESS + ':' + config.MONGO.PORT + '/test';

var cardID = 'sd123';
var analysisID;

/**
 * Tests a complete scenario involving sequences of requests
 */
describe("Routes", function () {
  before(function (done) {
    mongo.connect(mongoUrl, function (err) {
      expect(err).to.not.exist;

      mongo.db.dropDatabase(done);
    });
  });

  it("GET /platforms/" + cardID, function (done) {
    request(app)
    .get('/platforms/' + cardID)
    .expect(404)
    .end(done);
  });

  it("POST /platforms/" + cardID + "/analysis", function (done) {
    request(app)
    .post('/platforms/' + cardID + '/analysis')
    .send({ foo: 'bar' })
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('object');
      expect(body).to.have.property('cardID', cardID);
      expect(body).to.have.property('analysis').that.is.an('array').with.length(1);

      var analysis = body.analysis[0];
      expect(analysis).to.have.property('id').that.is.a('string');
      expect(analysis).to.have.property('foo', 'bar');

      analysisID = analysis.id;
    })
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        expect(err).to.not.exist;

        expect(doc).to.exist;
        expect(doc).to.have.property('cardID', cardID);
        expect(doc).to.have.property('analysis').that.is.an('array').with.length(1);

        var analysis = doc.analysis[0];
        expect(analysis).to.have.property('foo', 'bar');
        expect(analysis).to.have.property('id').that.is.an('object');
        expect(analysis.id.toString()).to.equal(analysisID);

        done();
      });
    });
  });

  it("POST /platforms/" + cardID + "/analysis/:id", function (done) {
    expect(analysisID).to.exist;

    request(app)
    .post('/platforms/' + cardID + '/analysis/' + analysisID)
    .send({ bar: 'foo' })
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('object');
      expect(body).to.have.property('cardID', cardID);
      expect(body).to.have.property('analysis').that.is.an('array').with.length(1);

      var analysis = body.analysis[0];
      expect(analysis).to.have.property('id', analysisID);
      expect(analysis).to.have.property('bar', 'foo');
    })
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        expect(err).to.not.exist;

        expect(doc).to.exist;
        expect(doc.cardID).to.equal(cardID);
        expect(doc).to.have.property('analysis').that.is.an('array').with.length(1);

        var analysis = doc.analysis[0];
        expect(analysis).to.have.property('bar', 'foo');
        expect(analysis).to.have.property('id').that.is.an('object');
        expect(analysis.id.toString()).to.equal(analysisID);

        done();
      });
    });
  });

  it("DELETE /platforms/" + cardID + "/analysis/:id", function (done) {
    expect(analysisID).to.exist;

    request(app)
    .delete('/platforms/' + cardID + '/analysis/' + analysisID)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('object');
      expect(body).to.have.property('analysis').that.is.an('array').with.length(0);
    })
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        expect(err).to.not.exist;

        expect(doc).to.exist;
        expect(doc).to.have.property('analysis').that.is.an('array').with.length(0);

        done();
      });
    });
  });

  it("GET /platforms/" + cardID, function (done) {
    request(app)
    .get('/platforms/' + cardID)
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
      var body = res.body;

      expect(body).to.be.an('object');
      expect(body).to.have.property('cardID', cardID);
      expect(body).to.have.property('analysis').that.is.an('array').with.length(0);
    })
    .end(done);
  });

  it("DELETE /platforms/" + cardID, function (done) {
    request(app)
    .delete('/platforms/' + cardID)
    .expect(204)
    .end(function (error) {
      expect(error).to.not.exist;

      mongo.get('platforms').findOne({ cardID: cardID }, function (err, doc) {
        expect(err).to.not.exist;
        expect(doc).to.not.exist;

        done();
      });
    });
  });
});