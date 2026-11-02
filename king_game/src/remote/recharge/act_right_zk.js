
'use strict';

const moment = require('moment');

module.exports = exports = async ({ctx, is_xufei}) =>{
	const {BUYITEMS, DAILYITEMS, DAILYLIMIT, NAME, NDAY}  = global.gameconfig.right.specialzk;
	const [{COUNT: ybdaily}] = DAILYITEMS;
	// 发放激活奖励
	ctx.role.addItemsNoSave(BUYITEMS);
	let info = {
		rid: ctx.role._id,type:2,
		title: ctx.textgetter('ZKRIGHT', NAME),
		content: ctx.textgetter('ZKRIGHTBUYFC', NAME, moment().format(global.gameconfig.text.TIME_FORMAT || 'YYYY年MM月DD日'), ybdaily),
	}
	if (is_xufei) {
		info.content = ctx.textgetter('ZKRIGHTBUYCC', NAME, NDAY, ybdaily);
	}else{
		ctx.role.addItemsNoSave(90634);
	}
	await ctx.dao.mail.create(info);
	// 发放当天奖励
	if (ctx.role.getItems(DAILYLIMIT).count < 1) {
		ctx.role.addItemsNoSave(DAILYLIMIT);
		ctx.role.special.zk--;
	}
	info.content = ctx.textgetter('ZKRIGHTDAILYC', NAME, NAME, ctx.role.special.zk);
	info.reward = DAILYITEMS;
	await ctx.dao.mail.create(info);
}
