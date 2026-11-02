
'use strict'
// 删除好友
module.exports = exports = async function (ctx, next) {
	// 删除好友,双向
	let friendId = ctx.request.body.id;// 好友id
	ctx.assert(friendId, 'invalid friendId');
	let findex = ctx.role.friends.findIndex(item => item == friendId)
	// 我自己删除这个好友
	findex != -1 ? ctx.role.friends.splice(findex, 1):'';
	// 对方好友列表删除我
	let heFriends = await ctx.dao.role.findOne({ _id: friendId }, { friends: 1 });
	ctx.assert(heFriends && heFriends.friends, 'invalid friendId');

	let hfindex = heFriends.friends.findIndex(item => item == ctx.role._id);
	hfindex != -1 ? heFriends.friends.splice(hfindex, 1):'';

	const cond = {
		$or: [
			{rid: ctx.role._id, to: friendId},	// 玩家给好友的
			{to: ctx.role._id, rid: friendId},	// 好友给玩家的
		]
	}
	await global.services.FriendService.del("friend:"+friendId);
	await global.services.FriendService.del("psendmap:"+friendId);
	await global.services.FriendService.del("preceivemap:"+friendId);
	const point = ctx.dao.fpoint.update(cond, {$set:{take: Date.now()}});

	await Promise.all([ point, ctx.role.save(), ctx.dao.role.updateOne({ _id: friendId },{$set:{friends: heFriends.friends}}) ]);

	await global.services.FriendService.del("friend:"+ctx.role._id.toString());
	await global.services.FriendService.del("psendmap:"+ctx.role._id.toString());
	await global.services.FriendService.del("preceivemap:"+ctx.role._id.toString());

	ctx.body = {};

}