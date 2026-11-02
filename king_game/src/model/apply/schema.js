
'use strict'

const APPLY_TYPES = [
	'friend',
	'legion',
	'teampvp',
	'tpinvite',
]

module.exports = exports = {
	type: {type: String, require: true, enum: APPLY_TYPES, index: 1},
	rid: {type: String, require: true, index: 1},
	to: {type: String, require: true, index: 1},
	create: {type: Number, default: Date.now},

	mark: {type: String},
}