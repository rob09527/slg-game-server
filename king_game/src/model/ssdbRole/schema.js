
'use strict'

module.exports = exports = {
	rid: { type: String, require: true, index: true },
	//层数
	layers: { type: Number, },
	//尝试次数
	try: { type: Number, },
	//0游戏待激活 1.游戏进行中（当前状态也可以领取奖励，领取过后游戏结束） 2.游戏结束 等待领取当前层数奖励
	state: { type: Number, },
	start: { type: Number, },
	//礼包详情
	gift: { type: Object },
	//地图宝箱
	box: { type: Object },
	//成就任务
	ach: { type: Object },
	//通行证
	txz: { type: Object },
	//商家兑换
	shop: { type: Object }
}
