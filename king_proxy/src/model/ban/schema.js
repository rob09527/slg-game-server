
'use strict'

module.exports = exports = {
	uid: {type: String, require: true, unique: true},
	expired: {type: Number, default: 9999999999999},
	create: {type: Number, default: Date.now},
}
