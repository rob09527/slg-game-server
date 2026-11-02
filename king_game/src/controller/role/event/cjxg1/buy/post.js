
'use strict'

module.exports = exports = async function (ctx, next) {
	let {index} = ctx.request.body;
	index = parseInt(index);
	const CJXG1 = ctx.config;
	let config = CJXG1[index];
	ctx.assert(config, 'invalid pindex');

	ctx.assert(ctx.role.vip >= config.VIP, 'vip limit');

	let record = ctx.role.cjxg1 || [];
	let bought = record[index] || 0;
	ctx.assert(config.LIMIT > bought, 'no more');

	ctx.role.castItemsNoSave(config.CAST);
    ctx.role.addItemsNoSave(config.ITEMS);
	record[index] = ++bought;
	ctx.role.cjxg1 = record;
	ctx.role.markModified('cjxg1');
	await ctx.role.save();
	ctx.body = {};
}
