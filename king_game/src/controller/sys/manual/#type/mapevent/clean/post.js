
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.role.mapevent.last = Date.now() - 5 * 180 * 60 * 1000;
	ctx.role.markModified('mapevent');
	await ctx.role.save();
	await ctx.dao.mapevent.remove({rid: ctx.role._id});
	ctx.body = {};
}