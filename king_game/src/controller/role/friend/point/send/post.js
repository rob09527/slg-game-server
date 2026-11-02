
'use strict'

module.exports = exports = async (ctx, next) =>{
	const {id} = ctx.request.body;
	const friends = new Set(ctx.role.friends);
	ctx.assert(friends.has(id), 'not friend');
	const cond = {rid: ctx.role._id, to: id};
	let fpoint = await ctx.dao.fpoint.findOne(cond);
	ctx.assert(!fpoint, 'already send');
	const {DAILYPSEND} = global.gameconfig.others.FRIEND;
	let avaliable = DAILYPSEND - ctx.role.getItems(90263).count;
	ctx.assert(avaliable > 0, 'no more');
	await global.services.FriendService.del("friend:"+id);
	await global.services.FriendService.del("psendmap:"+id);
	await global.services.FriendService.del("preceivemap:"+id);
	fpoint = await ctx.dao.fpoint.create(cond);
	ctx.role.addItemsNoSave({gsid: 90263, count: 1});
	const items = [{gsid: 38006, count: 5000}];
	ctx.role.addItemsNoSave(items);
	await ctx.role.save();
	await global.services.FriendService.del("friend:"+ctx.role._id.toString());
	await global.services.FriendService.del("psendmap:"+ctx.role._id.toString());
	await global.services.FriendService.del("preceivemap:"+ctx.role._id.toString());
	ctx.body = items;
}