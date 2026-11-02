
'use strict';

const moment = require('moment');

module.exports = exports = async ({ctx, is_xufei}) =>{
	const {BUYITEMS, DAILYITEMS, DAILYLIMIT, NAME, NDAY}  = global.gameconfig.right.specialgz;
	const [{COUNT: ybdaily}] = DAILYITEMS;
	// 发放激活奖励
	ctx.role.addItemsNoSave(BUYITEMS);
	let info = {
		rid: ctx.role._id,
		title: ctx.textgetter('YKRIGHTT', NAME),
		content: ctx.textgetter('YKRIGHTBUYFC', NAME, moment().format(global.gameconfig.text.TIME_FORMAT || 'YYYY年MM月DD日'), ybdaily),
	}
	if (is_xufei) {
		info.content = ctx.textgetter('YKRIGHTBUYCC', NAME, NDAY, ybdaily);
	}else{
		ctx.role.addItemsNoSave(90271);
	}
	await ctx.dao.mail.create(info);
	// 发放当天奖励
	if (ctx.role.getItems(DAILYLIMIT).count < 1) {
		ctx.role.addItemsNoSave(DAILYLIMIT);
		ctx.role.special.gz--;
		info.type = 2;
		info.content = ctx.textgetter('YKRIGHTDAILYC', NAME, NAME, ctx.role.special.gz);
		info.reward = DAILYITEMS;
		await ctx.dao.mail.create(info);
	}
}
