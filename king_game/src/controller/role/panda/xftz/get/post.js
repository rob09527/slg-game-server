
'use strict'
// 全服通关奖励
module.exports = exports = async function (ctx, next) {
	const id = ctx.request.body.floor
	assert(!ctx.CACHE.first[id], "is geted");
	let config = ctx.CONFIG[id];
	assert(config,"error floor");
	let info = await ctx.dao.c_xftz.find({floor: id, season: ctx.CACHE.season, servid: ctx.role.servid});
	assert(info, "error floor");

	ctx.CACHE.first[id] = 1;
	ctx.role.markModified('panda.xftz');
	ctx.role.addItemsNoSave(config.PASS, {main: 'xftz', sec: 'get_'+id});
	await ctx.role.save();

	ctx.body = {
		id,
		items: config.PASS,
	}
}