
'use strict'

module.exports = exports = {
	rid: {type: String, unique: true, require: true},
	create: {type: Number, default: Date.now},
}