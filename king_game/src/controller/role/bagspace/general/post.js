
'use strict'

const BAG_MARK = 90158;

module.exports = exports = async (ctx, next) =>{
	const count = ctx.role.getItems(BAG_MARK).count;
	const config = global.gameconfig.others.GBAGSPACE.CAST;
	ctx.assert(count < config.length, 'on limit');
	ctx.role.castItemsNoSave({gsid: 38005, count: config[count]});
	ctx.role.addItemsNoSave({gsid: BAG_MARK, count: 1});
	await ctx.role.save();
	ctx.body = {};
}