
'use strict'

module.exports = exports = {
	rid: {type: String, require: true},
	index: {type: Number, default: 0},
	subindex: {type: Number, default: 0},
	etime: {type: Number, default: 0},
	last: {type: Number},

	lastdamge: {type: Number, default: 0},
	totaldamge: {type: Number, default: 0},

	create: {type: Number, default: Date.now},
}