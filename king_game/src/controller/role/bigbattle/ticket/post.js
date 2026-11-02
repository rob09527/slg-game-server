
'use strict'

module.exports = exports = async (ctx, next) =>{
	const times = ctx.role.getItems(90214).count;
	const limit = 2 + global.gameconfig.vip.BIGBATTLE[ctx.role.vip];
	ctx.assert(times < limit, 'times limit');
	const num = global.gameconfig.others.BG_TICKET[times + 1];
	ctx.assert(num, 'no more');
	ctx.role.castItemsNoSave({gsid: 38005, count: num});
	ctx.role.addItemsNoSave([{gsid: 90214, count: 1}, {gsid: 30024, count: 1}]);
	await ctx.role.save();
	ctx.body = {};
}