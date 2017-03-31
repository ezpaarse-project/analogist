'use strict'

const MongoClient = require('mongodb').MongoClient
const mongo = {}

mongo.connect = function (url, callback) {
  if (mongo.db) { return callback(null, mongo.db) }

  MongoClient.connect(url, (err, database) => {
    if (err) { return callback(err) }

    mongo.db = database
    const platforms = database.collection('platforms')

    platforms.createIndex({ cardID: 1 }, { unique: true }, (err) => {
      if (err) { return callback(err, database) }

      platforms.createIndex({ 'analyses.id': 1 }, (err) => {
        callback(err, database)
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
