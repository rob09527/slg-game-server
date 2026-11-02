
/*
    竞猜单,玩家查看竞猜后生成,记录竞猜信息
    roundtype-roundindex用以区分是哪个环节哪个场次
*/

'use strict'

module.exports = exports = {
	// 服务器id
	servid: {type: Number, require: 1},
	// 角色ID
	uid: {type: String, require: 1},
	// topking.process 在冠军赛的进度(用于发邮件) 1(64强)；2(32强)；3(16强) 4(8强) 5(4强)；6(亚军)；7(冠军)
	progress: {type: Number, default: 0},
	// 值为topkingrecord.standing中每个二维子项,如   0_1,淘汰赛玩家不会再次遇上同一位玩家
	battlemark: {type: String, require: 1},
	// 竞猜铜钱金额
	amount: {type: Number},
	// 猜中后赔付金额
	repay: {type: Number},
	// 押左方是否胜利,如该值不存在,则玩家尚未竞猜(true则玩家押左方,false则玩家押右方)
	iswin: {type: Boolean},
	// 竞猜时间
	bettime: {type: Number},
	// 本单过期
	expire: {type: Number},
	// 单据创建时间
	create: {type: Number, default: Date.now},
}