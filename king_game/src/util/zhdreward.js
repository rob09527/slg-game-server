
'use strict'
// 周活动信息（招募积分、点将积分、观星达标）

const _ = require('lodash');
const { zhdprint } = require("../util/khlog")

module.exports = exports = async function (type, index, ctx,myselect) {
	let config = global.gameconfig.zhd[type];
	ctx.assert(config, 'invalid jfhd');
	let {
		MISSIONS,
		MARK,
		LOOPLIMIT,
	} = config;
	let looplimit = LOOPLIMIT[ctx.role.vip];
	let cycleScore = _.last(MISSIONS).NUM;
	// 可计算分限制在可用循环内
	let curScore = ctx.role.getProp(MARK);
	curScore = Math.min(curScore, looplimit * cycleScore);
	let curloop = Math.trunc(curScore / cycleScore);
	let mission = MISSIONS[Number.parseInt(index)];
	ctx.assert(mission, 'invalid index');
	let {
		MARK: rewardMark,
		NUM,
		ITEMS,
		SELECTITEMS:selectitems=[]
	} = mission;

	let markNum = ctx.role.getItems(rewardMark).count;
	ctx.assert(markNum <= curloop, 'already take');
	let needScore = cycleScore * markNum  + NUM;
	ctx.assert(curScore >= needScore, 'not finish');
	let items = [
		{gsid: rewardMark, count: 1},
		...ITEMS,
	]
	// 判断是否有可选奖励
	 selectitems  = selectitems[myselect]
	if (selectitems) items.push(selectitems);
	ctx.role.addItemsNoSave(items);
	await ctx.role.save();
	// 周活动日志-招募积分、点将积分、观星达标
	if(!ctx.isRemind) {    // 计算红点不记录日志
		zhdprint(
			type, ctx.role, markNum + 1, index + 1,
		);
	}
	ctx.body = items;
}
