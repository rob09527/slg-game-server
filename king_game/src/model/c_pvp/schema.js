
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, unique: true},
	refresh: {type: Number, default: Date.now},
	targets: [],
}