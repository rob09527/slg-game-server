
'use strict'
/**
 * @deprecated 功能废弃，取消点金玩法
 * @type {exports}
 */
module.exports = exports = async function (ctx, next) {
	assert.fail('请升级客户端');
	// const type = (parseInt(ctx.request.body.type) || 1) - 1;
	// const config = global.gameconfig.others.DIANJIN.INFO[type];
	// ctx.assert(config, 'invalid type');
	// ctx.assert(!ctx.role.getItems(config.MARK).count, 'on limit');
	// if (config.CAST) ctx.role.castItemsNoSave({gsid: 38005, count: config.CAST}, 'dianjin');
	// const vip_ex = global.gameconfig.vip.GOLD[ctx.role.vip];
	// let money = ((ctx.role.level - 1) * config.ADD + config.BASE) * (1 + vip_ex / 1000);
	// // 冬季加成
	// let {season} = ctx.bseason();
	// if (season == 4) {
	// 	const add = global.gameconfig.others.BATTLESEASON.VALS[season - 1];
	// 	money = money * (1 + add / 100);
	// }
	// ctx.body = [{gsid: 38006, count: Math.floor(money)}];
	// ctx.role.addItemsNoSave([{gsid: config.MARK, count: 1}].append(ctx.body), 'dianjin');
	// await ctx.role.missionInvoke('DIANJIN_DAILY_HISTORY').save();
	// // 职业任务
	// ctx.jobtask({mark:90382, rid: ctx.role._id}).catch(console.error);
}
