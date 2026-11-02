
'use strict'

module.exports = exports = async function (ctx, next) {
	let {index} = ctx.request.body;
	index = parseInt(index);
	let config = ctx.config[index];
	ctx.assert(config, 'invalid general');
	let bought = ctx.role.xsdh[index] || 0;
	ctx.assert(bought < config.LIMIT, 'no more');
	ctx.role.castItemsNoSave(config.CONSUME);
	ctx.role.addItemsNoSave(config.GRCH);
	ctx.role.xsdh[index] = ++bought;
	ctx.role.markModified('xsdh.'+index);
	await ctx.role.save();
	ctx.body = {};
	// 周活动日志-英雄兑换
	ctx.zhdprint("xsdh", config.GRCH[0].GSID)
}