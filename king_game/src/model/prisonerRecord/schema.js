/**
 * 天牢战报记录
 */
'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
	rid: { type: String, require: true, index: 1 },
	state: { type: Number, require: true, index: 1 },
	headid: { type: Number },
	iconid: { type: Number },
	name: { type: String },
	win: { type: Boolean },
	//对手id
	opponent: { type: String },
	info: [],
	create: { type: Number, default: Date.now },
}