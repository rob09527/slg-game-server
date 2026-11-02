
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, index:1},
	to: {type: String, require: true, index: 1},
	take: {type: Number},
	create: {type: Number, default: Date.now},
}