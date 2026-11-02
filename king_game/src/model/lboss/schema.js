
'use strict'

const {Schema} = require('mongoose');
/**
 * 军团BOSS
 * @type {{legion: {require: boolean, type: StringConstructor}, last: {default: () => number, type: NumberConstructor}, totaldamges: {default: number, type: NumberConstructor}, start: {default: () => number, type: NumberConstructor}, _roles: {default: {}, type: Mixed}, index: {default: number, type: NumberConstructor}, killed: {by: {type: StringConstructor}, time: {type: NumberConstructor}}}}
 */
module.exports = exports = {
	legion: {type: String, require: true},

	index: {type: Number, default: 0},
	start: {type: Number, default: Date.now},
	last: {type: Number, default: Date.now},
	totaldamges: {type: Number, default: 0},

	killed: {
		time: {type: Number},
		by: {type: String},
	},

	_roles: {type: Schema.Types.Mixed, default: {}},	// 参与者
}
