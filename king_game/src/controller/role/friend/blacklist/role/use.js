
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		target,
	} = ctx.request.body;
	ctx.record = await ctx.dao.blacklist.findOne({rid: ctx.role._id, target});
	await next();

	await global.services.FriendService.del("friend:"+ctx.role._id.toString());
	await global.services.FriendService.del("psendmap:"+ctx.role._id.toString());
	await global.services.FriendService.del("preceivemap:"+ctx.role._id.toString());
}