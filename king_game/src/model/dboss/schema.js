
'use strict'

/**
 * @deprecated 废弃 2020-09-23
 * @type {{lastdamge: {default: number, type: NumberConstructor}, totaldamge: {default: number, type: NumberConstructor}, create: {default: () => number, type: NumberConstructor}, id: {require: boolean, type: NumberConstructor}, rid: {index: boolean, require: boolean, type: StringConstructor}, kill: {type: NumberConstructor}}}
 */
module.exports = exports = {
	rid: {type: String, require: true, index: true},
	id: {type: Number, require: true},

	totaldamge: {type: Number, default: 0},
	lastdamge: {type: Number, default: 0},

	kill: {type: Number},
	create: {type: Number, default: Date.now},
}
