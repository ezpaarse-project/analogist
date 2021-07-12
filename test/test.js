/* global before, describe, it */
/* eslint global-require: 0, no-unused-expressions: 0 */
'use strict'

process.env.NODE_ENV = 'production'

const request = require('supertest')
const expect  = require('chai').expect

const config  = require('config')
const mongo   = require('../lib/mongo')
let app

config.bypass = true
config.history.debounceTime = 0

const mongoUrl = `mongodb://${config.mongo.host}:${config.mongo.port}/test`

const cardID = 'sd123'
let analysisID
let historyID

/**
 * Tests a complete scenario involving sequences of requests
 */
describe('Routes', function () {
  this.timeout(5000)

  before(done => {
    mongo.connect(mongoUrl, (err) => {
      if (err) { throw err }

      app = require('../app')
      mongo.db.dropDatabase(done)
    })
  })

  it(`GET    /api/platforms/${cardID}`, done => {
    request(app)
      .get(`/api/platforms/${cardID}`)
      .expect(404)
      .end(done)
  })

  it(`GET    /api/platforms/${cardID}/analyses`, done => {
    request(app)
      .get(`/api/platforms/${cardID}/analyses`)
      .expect(404)
      .end(done)
  })

  it(`POST   /api/platforms/${cardID}/analyses`, done => {
    request(app)
      .post(`/api/platforms/${cardID}/analyses`)
      .send({ foo: 'bar' })
      .expect('Content-Type', /json/)
      .expect(201)
      .expect((res) => {
        const body = res.body

        expect(body).to.be.an('object')
        expect(body).to.have.property('id').that.is.a('string')
        expect(body).to.have.property('foo', 'bar')

        analysisID = body.id
      })
      .end((error) => {
        expect(error).to.not.exist

        mongo.get('platforms').findOne({ cardID: cardID }, (err, doc) => {
          if (err) { throw err }

          expect(doc).to.exist
          expect(doc).to.have.property('cardID', cardID)
          expect(doc).to.have.property('analyses').that.is.an('array').with.length(1)

          const analysis = doc.analyses[0]
          expect(analysis).to.have.property('foo', 'bar')
          expect(analysis).to.have.property('id').that.is.an('object')
          expect(analysis.id.toString()).to.equal(analysisID)

          done()
        })
      })
  })

  it(`PUT    /api/platforms/${cardID}/analyses/:id`, done => {
    expect(analysisID).to.exist

    request(app)
      .put(`/api/platforms/${cardID}/analyses/${analysisID}`)
      .send({ bar: 'foo' })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        const body = res.body

        expect(body).to.be.an('object')
        expect(body).to.have.property('cardID', cardID)
        expect(body).to.have.property('analyses').that.is.an('array').with.length(1)

        const analysis = body.analyses[0]
        expect(analysis).to.have.property('id', analysisID)
        expect(analysis).to.have.property('bar', 'foo')
      })
      .end((error) => {
        expect(error).to.not.exist

        mongo.get('platforms').findOne({ cardID: cardID }, (err, doc) => {
          if (err) { throw err }

          expect(doc).to.exist
          expect(doc.cardID).to.equal(cardID)
          expect(doc).to.have.property('analyses').that.is.an('array').with.length(1)

          const analysis = doc.analyses[0]
          expect(analysis).to.have.property('bar', 'foo')
          expect(analysis).to.have.property('id').that.is.an('object')
          expect(analysis.id.toString()).to.equal(analysisID)

          done()
        })
      })
  })

  it(`GET    /api/platforms/${cardID}`, done => {
    request(app)
      .get(`/api/platforms/${cardID}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        const body = res.body

        expect(body).to.be.an('object')
        expect(body).to.have.property('cardID', cardID)
        expect(body).to.have.property('analyses').that.is.an('array').with.length(1)
        expect(body.analyses[0]).to.have.property('bar', 'foo')
      })
      .end(done)
  })

  it(`GET    /api/platforms/${cardID}/analyses`, done => {
    request(app)
      .get(`/api/platforms/${cardID}/analyses`)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        const body = res.body

        expect(body).to.be.an('array').with.length(1)
        expect(body[0]).to.have.property('bar', 'foo')
      })
      .end(done)
  })

  it(`DELETE /api/platforms/${cardID}/analyses/:id`, done => {
    expect(analysisID).to.exist

    request(app)
      .delete(`/api/platforms/${cardID}/analyses/${analysisID}`)
      .expect(204)
      .end((error) => {
        expect(error).to.not.exist

        mongo.get('platforms').findOne({ cardID: cardID }, (err, doc) => {
          if (err) { throw err }

          expect(doc).to.exist
          expect(doc).to.have.property('analyses').that.is.an('array').with.length(0)

          done()
        })
      })
  })

  it('GET    /api/analyses/:aid/history', done => {
    expect(analysisID).to.exist

    request(app)
      .get(`/api/analyses/${analysisID}/history`)
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        const body = res.body

        expect(body).to.be.an('array').with.length(2)

        expect(body[0]).to.have.property('analysisId')
        expect(body[1]).to.have.property('analysisId')

        expect(body[0]).to.have.property('updatedBy')
        expect(body[1]).to.have.property('updatedBy')

        const date1 = new Date(body[0].updatedAt)
        const date2 = new Date(body[1].updatedAt)
        expect(date1.getTime()).to.be.above(date2.getTime())

        expect(body[0]).to.have.property('bar', 'foo') // then updated with bar:foo
        expect(body[1]).to.have.property('foo', 'bar') // was inserted with foo:bar

        historyID = body[1]._id
      })
      .end(done)
  })

  it('DELETE    /api/analyses/:aid/history/:hid', done => {
    request(app)
      .delete(`/api/analyses/${analysisID}/history/${historyID}`)
      .expect(204)
      .end((error) => {
        expect(error).to.not.exist

        mongo.get('history').findOne({ _id: historyID }, (err, doc) => {
          if (err) { throw err }

          expect(doc).to.be.null
        })

        done()
      })
  })
})
