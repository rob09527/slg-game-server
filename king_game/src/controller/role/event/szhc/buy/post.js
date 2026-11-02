
'use strict'

module.exports = exports = async function (ctx, next) {
	let {index} = ctx.request.body;
	index = parseInt(index);
	let config = ctx.config;
	config = config[index];
	ctx.assert(config, 'invalid index');
	let {LIMIT, DEMAND, CONSUME} = config;
	let bought = ctx.role.szhc[index] || 0;
	ctx.assert(bought < LIMIT, 'no more');
	ctx.role.castItemsNoSave(DEMAND);
	ctx.role.addItemsNoSave(CONSUME);
	ctx.role.szhc[index] = ++bought;
	ctx.role.markModified('szhc');
	await ctx.role.save();
	ctx.body = CONSUME;
	// 周活动日志-神装打造
	ctx.zhdprint("szhc", index + 1)
}