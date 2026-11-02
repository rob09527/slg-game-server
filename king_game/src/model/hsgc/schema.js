
'use strict'

module.exports = exports = {
	score : {type: Number, default: 0},
	stage: {type: Number, default: 1},
	servid: {type: Number, require: true, index: 1},
	hour:{ type: Number, require: true},
	monster_stage:{type: Number, default:0},
	addStage:{type: Boolean, default:false},
	id:{type: Number, require: true},
}