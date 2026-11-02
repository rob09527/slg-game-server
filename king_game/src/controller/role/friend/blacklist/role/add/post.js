
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(!ctx.record, 'already added');
	let {
		target,
	} = ctx.request.body;
	target = await ctx.dao.role.findOne({_id: target});
	ctx.assert(target, 'target nexist');
	await ctx.dao.blacklist.create({rid: ctx.role._id, target: target._id});
	let myfriendlist = new Set(ctx.role.friends);
	if (myfriendlist.has(target.i())) {
		// 删除好友
		myfriendlist.delete(target.i());
		myfriendlist = Array.from(myfriendlist);
		await ctx.role.updateOne({$set: {friends: myfriendlist}});
		let tarfriendlist = new Set(target.friends);
		tarfriendlist.delete(ctx.role.i());
		await target.updateOne({$set: {friends: Array.from(tarfriendlist)}});
	}
	let {
		rid,
		headid,
		frameid,
		rname,
		level,
	} = target.avatarInfo();
	ctx.body = {
		rid,
		headid,
		frameid,
		rname,
		level,
		lasttime: target.update,
	}
	
}