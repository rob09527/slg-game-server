
'use strict'

module.exports = exports = {
	// 服务器ID
	servid: {type: Number, require: true},
	// 队伍名称
	name: {type: String, require: true},
    // 难度
    pos: {type:Number, require: true},
    // 等级限制
    level:{type:Number, require: true},
	// 加入所需战力
	pneed: {type: Number, default: 1},
    // 合并
    merge:{type: Boolean, require:true},
	/*
		成员列表,出战按数组顺序,结构如下
		fellows: [
            {
			    rid: '5e2c4bc0e2f13c46e39cb2a4',
                是否助战
                help:false
            }
		]
	*/
	fellows: [],
    // 开启挑战标识
    challenge:{type: Boolean, default:false},
	// 开始挑战时间
	challengetime: {type: Number, default:0},
	// 挑战者
	challengerid:{type: String},
    // 类型 2组队 3隐藏
    type:{type:Number, require: true},
}