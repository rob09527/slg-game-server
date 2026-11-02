
'use strict'
// 全服通关奖励
module.exports = exports = async function (ctx, next) {
	const id = ctx.request.body.id
	assert(!ctx.CACHE.flag[id], "is geted");
	let items = ctx.CONFIG.REWARD[id];
	assert(items,"error id");
	let info = await ctx.dao.legend.findOne({season: ctx.CACHE.season, servid: ctx.role.servid});
	assert(info, "error id");
	assert(info.damage >= id, "no pass");
	ctx.CACHE.flag[id] = 1;
	ctx.role.markModified('panda.cstz');
	ctx.role.addItemsNoSave(items, {main: 'cstz', sec: 'get_'+id});
	await ctx.role.save();

	ctx.body = {
		flag: ctx.CACHE.flag,
		items
	}
}