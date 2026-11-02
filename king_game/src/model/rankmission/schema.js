
'use strict'

const fs = require('fs');

module.exports = exports = {
	// 排行榜类型
	type: {type: String, require: 1, index: 1},
	// 任务在配置表里的下标
	missionIndex: {type: Number, require: 1},

	//
	servid: {type: Number},
	/*
		前X名达成的玩家列表,格式如下
		roles: [
			{
				rid: 'xxxxxxx',
				time: 123123123123123,
			},
			...
		]
	*/
	roles: [],
	// 跨服组id
	groupid:{type:Number, require: 1}
}
