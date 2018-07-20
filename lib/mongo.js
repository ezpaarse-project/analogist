'use strict'

const MongoClient = require('mongodb').MongoClient
const mongo = {}

mongo.connect = function (url, callback) {
  if (mongo.db) { return callback(null, mongo.db) }

  MongoClient.connect(url, (err, client) => {
    if (err) { return callback(err) }

    mongo.db = client.db()
    const platforms = mongo.db.collection('platforms')

    platforms.createIndex({ cardID: 1 }, { unique: true }, (err) => {
      if (err) { return callback(err, mongo.db) }

      platforms.createIndex({ 'analyses.id': 1 }, (err) => {
        callback(err, mongo.db)
      })
    })
  })
}

mongo.disconnect = function (callback) {
  if (!mongo.db) { return callback(null) }

  mongo.db.close((err) => {
    mongo.db = null
    callback(err)
  })
}

mongo.get = function (col) {
  return (mongo.db ? mongo.db.collection(col) : null)
}

module.exports = mongo
