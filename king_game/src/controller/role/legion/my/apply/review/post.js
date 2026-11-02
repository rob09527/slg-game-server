
'use strict'

module.exports = exports = async (ctx, next) => {
	const { arr, accept } = ctx.request.body;
	ctx.body = { ret: [] };
	let available = ctx.legion.mpnum - ctx.legion._members.length;
	for (const applyid of arr) {
		const apply = await ctx.dao.apply.findOne({ _id: applyid });
		let result = {};
		let isAccept = false;
		try {
			ctx.assert(apply, 'apply nexist');
			if (accept) {
				ctx.assert(available > 0, 'member full');
				const role = await ctx.dao.role.findOne({ _id: apply.rid });
				ctx.assert(role, 'role nexist');
				ctx.assert(!role.legion, 'already join');
				ctx.assert(Date.now() >= role.legionetime, 'cd nyet');
				available--;
				role.legion = ctx.legion._id;
				role.legionName = ctx.legion.name;
				role.legionjointime = Date.now();// 加入军团时间
				role.missionInvoke('LEGION_JOIN');
				ctx.legion._members.push({
					rid: role.i(),
					pos: 0,
				})
				ctx.legion.markModified('_members');
				ctx.legion.markModified('legionjointime');
				await ctx.dao.mail.create({
					rid: role.i(),
					title: ctx.textgetter('LEGIONGREETT'),
					content: ctx.textgetter('LEGIONGREETC', ctx.legion.name),
				})
				await role.save()
				let log = {
					event: 'memberjoin',
					legion: ctx.legion._id,
					params: [role.name],
				}
				ctx.dao.c_legionlog.create(log).catch(console.error);	// async
				// 同意则移除该玩家其他军团申请
				await ctx.dao.apply.remove({ rid: apply.rid, type: 'legion' });
				isAccept = true;
			}
			if (!isAccept) {
				// 不同意则移除玩家这个军团申请
				await apply.remove();
			}
		} catch (err) {
			result.error = err.message;
		}
		ctx.body.ret.push(result);
	}
	await ctx.legion.save();
}
