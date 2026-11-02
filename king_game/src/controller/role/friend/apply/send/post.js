
'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

// 发送好友申请
module.exports = exports = async function (ctx, next) {
	let { rids } = ctx.request.body;
	if (!Array.isArray(rids)) rids = [rids];
	const maxfnum = global.gameconfig.others.FRIEND.MAXFRIENDNUM;
	let available = maxfnum - ctx.role.friends.length;
	const ownerId = ctx.role.i();
	rids = rids.filter(rid => rid !== ownerId); // @author awko 过滤掉自己
	ctx.assert(rids.length, 'rids empty');
	ctx.assert(available > 0, 'friend full');
	ctx.body = { ret: [] };

	for (const rid of rids) {
		let ret = {};
		let role = await ctx.dao.role.findOne({ _id: rid }, { _id: 1 }); // 优化一下，不需要查询所有字段
		try {
			ctx.assert(rid !== ctx.role.i(), 'add urself');
			ctx.assert(role, 'role nexist');
			// 角色是否在目标的黑名单中
			let block = await ctx.dao.blacklist.findOne({ rid, target: ctx.role._id });
			ctx.assert(!block, 'in blacklist');
			// 目标是否在角色的黑名单中
			block = await ctx.dao.blacklist.findOne({ target: rid, rid: ctx.role._id });
			ctx.assert(!block, 'target blocked');
			const index = ctx.role.friends.indexOf(role.i());
			ctx.assert(index == -1, 'already friend');
			ctx.assert(available, 'friend full');
		} catch (err) {
			ret.error = err.message;
		}
		ctx.body.ret.push(ret);
		if (ret.error) continue;
		available--;
		// 搜索是否有这个申请信息,有  更新时间 ；无 创建;
		let applyInfo = await ctx.dao.apply.findOne({ type: 'friend', rid: ctx.role._id, to: role._id });
		if (applyInfo) {
			applyInfo.create = Date.now();
			applyInfo.markModified('create');
			await applyInfo.save();
		} else {
			await ctx.dao.apply.create({ type: 'friend', rid: ctx.role._id, to: role._id });
		}

	}

	await secretTask(ctx, 99661, 1)
	await global.services.FriendService.del("friend:" + ctx.role._id.toString());
	await global.services.FriendService.del("psendmap:" + ctx.role._id.toString());
	await global.services.FriendService.del("preceivemap:" + ctx.role._id.toString());

}
