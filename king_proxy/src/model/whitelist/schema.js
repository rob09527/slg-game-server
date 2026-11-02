
'use strict'

module.exports = exports = {
	uid: {type: String, require: true, unique: true},
	create: {type: Number, default: Date.now},
}
