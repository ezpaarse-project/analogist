'use strict';

var MongoClient = require('mongodb').MongoClient;
var mongo = {};

var indexes = [
  {
    key: { cardID: 1 },
    unique: true
  },
  {
    key: { 'analyses.id': 1 }
  }
];

mongo.connect = function (url, callback) {
  if (mongo.db) { return callback(null, mongo.db); }

  MongoClient.connect(url, function (err, database) {
    if (err) { return callback(err); }

    mongo.db = database;

    database.collection('platforms').createIndexes(indexes, function (err) {
      callback(err, database);
    });
  });
};

mongo.disconnect = function (callback) {
  if (mongo.db) {
    mongo.db.close(function (err) {
      mongo.db = null;
      callback(err);
    });
  } else {
    callback(null);
  }
};

mongo.get = function (col) {
  return (mongo.db ? mongo.db.collection(col) : null);
};

module.exports = mongo;
