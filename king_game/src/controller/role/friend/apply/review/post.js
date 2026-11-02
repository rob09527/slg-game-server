
'use strict'

const secretTask = require("../../../../../model/secretRealmRole/instance/secretTask");

// 同意申请/拒绝申请
module.exports = exports = async function (ctx, next) {
	let { isagree, arr } = ctx.request.body;
	if (!Array.isArray(arr)) arr = [arr];
	const maxfnum = global.gameconfig.others.FRIEND.MAXFRIENDNUM;
	let available = maxfnum - ctx.role.friends.length;
	ctx.body = { ret: [] };
	const friends = ctx.role.friends || [];
	for (const applyid of arr) {
		let ret = {};
		const apply = await ctx.dao.apply.findOne({ _id: applyid });
		try {
			ctx.assert(apply, 'apply nexist');
			if (isagree) {
				ctx.assert(available, 'friend full');
				const index = ctx.role.friends.indexOf(apply.rid);
				ctx.assert(index == -1, 'already friend');

				const role = await ctx.dao.role.findOne({ _id: apply.rid });
				ctx.assert(role, 'role nexist');
				ctx.assert(maxfnum - role.friends.length > 0, 'rfriend full');

				await ctx.dao.role.updateOne({ _id: apply.rid }, {
					$addToSet: { friends: ctx.role.i() }
				})
				available--;
				friends.push(apply.rid);



			}
		} catch (err) {
			ret.error = err.message;
		}
		if (apply) await apply.remove();
		ctx.body.ret.push(ret);
	}
	if (isagree) {
		await global.services.FriendService.del("friend:" + ctx.role._id.toString());
		await global.services.FriendService.del("psendmap:" + ctx.role._id.toString());
		await global.services.FriendService.del("preceivemap:" + ctx.role._id.toString());
	}
	await ctx.dao.role.updateOne({ _id: ctx.role._id }, {
		$addToSet: {
			friends: {
				$each: friends
			}
		}
	})
}
