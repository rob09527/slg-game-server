
'use strict'

module.exports = exports = {
	teamid: {type: String, require: true, unique: true},
	refresh: {type: Number, default: Date.now},
	targets: [],
}