
'use strict'

module.exports = exports = {
	floor : {type: Number, require: true, index: 1},
	season: {type: Number, require: true},
	servid: {type: Number, require: true},
	player: {type: Object, default: {}},
	create: {type: Number, default: Date.now},
}
		