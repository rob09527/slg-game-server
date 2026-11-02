
'use strict'

module.exports = exports = {
    // 创建时间
	create: {type: Number, default: Date.now},
    // 战绩
    ids: {type: Array, require: true},
    //
    player: {type: Array, require: true},
    win:{type: Boolean, require: true},
    name:{type: String, require: true},
}