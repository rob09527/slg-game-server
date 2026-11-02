
'use strict'

module.exports = exports = {
	rid: {type: String, require: true},
	type: {type: String, enum: ['weekly', 'monthly']},
	end: {type: Number, default: 0},
	index: {type: Number, default: 0},
	items: [],
}