'use strict';

var MongoClient = require('mongodb').MongoClient;
var mongo = {};

mongo.connect = function (url, callback) {
  if (mongo.db) { return callback(null, mongo.db); }

  MongoClient.connect(url, function (err, database) {
    if (err) { return callback(err); }

    mongo.db = database;
    var platforms = database.collection('platforms');

    platforms.createIndex({ cardID: 1 }, { unique: true }, function (err) {
      if (err) { return callback(err, database); }

      platforms.createIndex({ 'analyses.id': 1 }, function (err) {
        callback(err, database);
      });
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
