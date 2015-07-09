'use strict';

var config = require('../config.json');
var MongoClient  = require('mongodb').MongoClient;

var mongo = {};

mongo.connect = function (callback) {
  if (mongo.db) { return callback(null, mongo.db); }

  MongoClient.connect(config.MONGO_URL, function (err, database) {
    mongo.db = database;
    callback(err, database);
  });
};

mongo.disconnect = function (callback) {
  if (mongo.db) {
    mongo.db.close(callback);
  } else {
    callback(null);
  }
};

module.exports = mongo;
