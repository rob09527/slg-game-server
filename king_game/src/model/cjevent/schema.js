
'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: 1},
	step: {type: Number, default: 0},
	pos: {type: Number},

	boss: {	// boss内容
		// id: {type: Number},
		// lastdamge: {type: Number, default: 0},
		// totaldamge: {type: Number, default: 0},
	},

	finish: {type: Number},
	create: {type: Number, default: Date.now},
}