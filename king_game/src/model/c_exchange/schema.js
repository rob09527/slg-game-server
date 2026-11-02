
'use strict'

module.exports = exports = {
	rid: {type: String, unique: true, require: true},
	general: {type: String, unique: true},
	gsid: {type: Number, require: true},
	update: {type: Number, default: Date.now}
}
