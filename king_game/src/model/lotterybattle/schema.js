
/*
    战斗场次竞猜统计缓存数据
    左方支持率=押左方人次/(押左方人次 + 押右方人次)
    右方支持率同左方
*/

'use strict'

module.exports = exports = {
	// 值为topkingrecord.standing中每个二维子项,如   0_1,淘汰赛玩家不会再次遇上同一位玩家
	battlemark: {type: String, unique: 1},
	// 押左方人次
	left: {type: Number, default: 0},
	// 押右方人次
	right: {type: Number, default: 0},
	// 更新时间
	update: {type: Number, default: Date.now},
	// 战斗结果,使用this.result存取数据,
	// json的字符串,解析后格式
	// {
	// 	result: 'win',
	// 	videoid: 'xxxxx',
	// }
	_result: {type: String},
	// 创建时间
	create: {type: Number, default: Date.now},
}