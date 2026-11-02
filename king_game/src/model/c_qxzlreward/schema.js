
'use strict'

module.exports = exports = {
	rid: {type: String, require: true, index: 1},
    // 创建时间
	create: {type: Number, default: Date.now, index: 1},
    // 奖励
    reward: {type: Array, require: true},
    //
    player: {type: Array, require: true},
    //战绩id
    record_id: {type: String, require: true},
    name:{type: String, require: true},
    state:{type: Number, default:0, index: 1},
}