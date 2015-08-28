'use strict';

var path  = require('path');
var nconf = require('nconf');

// top = higher priority
nconf.argv() // command line
     .env('__') // environment with __ as separator for nested keys
     .file('local',   path.join(__dirname, '../config/config.json')) // optional config file
     .file('default', path.join(__dirname, '../config/default.json')); // default config file

module.exports = nconf.get();
