
'use strict'

module.exports = exports = async (ctx, next) =>{
	const {id} = ctx.request.body;
	let {DAILYPRECE} = global.gameconfig.others.FRIEND;
	let avaliable = DAILYPRECE - ctx.role.getItems(90308).count;
	ctx.assert(avaliable > 0, 'no more');
	const fpoint = await ctx.dao.fpoint.findOne({rid: id, to: ctx.role._id});
	ctx.assert(fpoint, 'no point');
	ctx.assert(!fpoint.take, 'already take');
	fpoint.take = Date.now();
	await fpoint.save();
	const items = [{gsid: 30019, count: 1}, {gsid: 90308, count: 1}];
	ctx.role.addItemsNoSave(items);
	await ctx.role.save();
	ctx.body = items;
	await global.services.FriendService.del("friend:"+id);
	await global.services.FriendService.del("psendmap:"+id);
	await global.services.FriendService.del("preceivemap:"+id);


	await global.services.FriendService.del("friend:"+ctx.role._id.toString());
	await global.services.FriendService.del("psendmap:"+ctx.role._id.toString());
	await global.services.FriendService.del("preceivemap:"+ctx.role._id.toString());
}