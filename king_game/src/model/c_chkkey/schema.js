
'use strict'

module.exports = exports = {
	rid: {type: String, require: true},
	type: {type: String, require: true},
	key: {type: String, require: true},
	valid: {type: Boolean, default: true},
	refresh: {type: Number, default: Date.now},
	mark: {type: String},
}