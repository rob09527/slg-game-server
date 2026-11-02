
'use strict'

const {Schema} = require('mongoose');

module.exports = exports = {
	rid:{type:String, index:true, require:true},
	data:{type:Schema.Types.Mixed, default:{}},
	create: {type: Number, default: Date.now},
}
