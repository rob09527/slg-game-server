
'use strict'
const { hitHere } = require("../../../../util/weektarget");

module.exports = exports = async function (ctx, next) {
	let lv = ctx.role.getItems(38004).count;
	lv = lv > global.gameconfig.officialitems.length ? global.gameconfig.officialitems.length - 1: lv;
	const config = global.gameconfig.officialitems[lv];
	ctx.assert(config, 'invalid lv');
	const is_receive = ctx.role.getItems(90162).count;
	ctx.assert(!is_receive, 'already receive');
	ctx.body = config.SALARY;
	ctx.role.addItemsNoSave([{gsid: 90162, count: 1}].append(ctx.body));
	ctx.role.missionInvoke('OFFICIAL_SALARY_HISTORY');
	// 新七日目标，领取军衔日常俸禄次数
	hitHere(ctx.role, 98640, 1, true);
	await ctx.role.save();
}
