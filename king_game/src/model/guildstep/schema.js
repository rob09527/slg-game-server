
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, index: 1},
	step: {type: Number, require: true},
	mark: {},
	create: {type: Number, default: Date.now},
}