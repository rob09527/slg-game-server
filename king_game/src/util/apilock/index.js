
'use strict';

const cluster = require('cluster');

let apiname = cluster.isWorker? 'multi': 'native';

module.exports = exports = require('./'+apiname);