
'use strict'

// const {Schema} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: true},
	type: {type: String, require: true},
	gsid: {type: Number},
	count: {type: Number},

	time: {type: Number, default: Date.now},
}