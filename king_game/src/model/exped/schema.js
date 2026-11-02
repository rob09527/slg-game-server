
'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
	rid: {type: String, require: true, index: 1},
	map: [],
	hp: {type: Schema.Types.Mixed, default: {}},
	wish: {type: Schema.Types.Mixed, default: [0, 0, 0]},
	refresh: {type: Number, default: Date.now},
}