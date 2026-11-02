
'use strict'

module.exports = exports = {
	legion: {type: String, require: 1, index: 1},
	type: {type: Number, default: 1},
	rid: {type: String},
	name: {type: String},
	exp: {type: Number},
	score: {type: Number},
	create: {type: Number, default: Date.now},
}