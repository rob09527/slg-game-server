
'use strict'

module.exports = exports = async function (ctx, next) {
	let {index} = ctx.request.body;
	index = parseInt(index);
	let {JRLB1} = global.gameconfig.zhd;
	let config = JRLB1[index];
	ctx.assert(config, 'invalid pindex');

	ctx.assert(ctx.role.vip >= config.VIP, 'vip limit');

	let record = ctx.role.jrlb1 || [];
	let bought = record[index] || 0;
	ctx.assert(config.LIMIT > bought, 'no more');

	ctx.role.castItemsNoSave(config.CAST);

	record[index] = ++bought;
	ctx.role.jrlb1 = record;
	ctx.role.markModified('jrlb1');
	await ctx.role.save();
	ctx.body = {};

	ctx.dao.mail.create({
		type: 2, rid: ctx.role._id,
		title: ctx.textgetter('ZHDJRLB1T'),
		content: ctx.textgetter('ZHDJRLB1C'),
		reward: config.ITEMS,
	}).catch(console.error);
}