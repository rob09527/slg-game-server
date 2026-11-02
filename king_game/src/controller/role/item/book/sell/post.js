
'use strict'

module.exports = exports = async (ctx, next) =>{
	let count = parseInt(ctx.request.body.count) || 1;

	const type = 'book';
	let gsid = ctx.request.body[type];

	let config = global.gameconfig[type][gsid];
	ctx.assert(config, 'invalid props');
	ctx.body = [{gsid: 38006, count: config.PRICE * count}];

	ctx.role.castItemsNoSave({gsid: gsid, count: count});
	ctx.role.addItemsNoSave(ctx.body);
	await ctx.role.save();
}
