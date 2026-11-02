
'use strict'

module.exports = exports = async (ctx, next) => {
	const { legionid } = ctx.request.body;
	ctx.assert(!ctx.role.legion, 'already join');		// 已加入
	ctx.assert(Date.now() >= ctx.role.legionetime, 'not cd');		// 离开时间足够
	const legion = await ctx.dao.legion.findOne({ _id: legionid });
	ctx.assert(legion, 'invalid legion');		// 军团存在
	ctx.assert(legion.mpnum - legion._members.length > 0, 'member full');		// 军团空位
	const result = {};
	// 新加入军团，清除军团战阵营信息
	await ctx.dao.role.updateOne({ _id: ctx.role._id }, {
		$unset: {
			"battlearr.legionpvp1.camp": 1,
			"battlearr.legionpvp2.camp": 1
		}
	});
	if (legion.ispass) {	// 需要申请
		ctx.assert(ctx.role.level >= legion.minlv, 'level limit');		// 等级大于等于要求
		legion._members.push({
			rid: ctx.role._id.toString(),
			pos: 0
		})
		legion.markModified('_members');
		ctx.role.legion = legion._id;
		ctx.role.legionName = legion.name;
		const legionroom = `legion_` + ctx.role.legion;
		// 加入军团房间
		global.socketRedis.joinRoom(ctx.role.i(), legionroom);

		const mail = ctx.dao.mail.create({
			rid: ctx.role.i(),
			title: ctx.textgetter('LEGIONGREETT'),
			content: ctx.textgetter('LEGIONGREETC', legion.name),
		})
		ctx.role.legionjointime = Date.now();// 加入军团时间
		ctx.role.markModified('legionjointime');
		ctx.role.missionInvoke('LEGION_JOIN');
		// 移除所有军团申请
		let removeApply = ctx.dao.apply.remove({ type: 'legion', rid: ctx.role._id });
		await Promise.all([legion.save(), ctx.role.save(), mail, removeApply]);
		result.id = legion._id.toString();
		ctx.dao.c_legionlog.create({ legion: legion._id, event: 'memberjoin', params: [ctx.role.name] }).catch(console.error);	// async
	} else {
		let apply = await ctx.dao.apply.findOne({ type: 'legion', to: legion._id, rid: ctx.role._id });
		ctx.assert(!apply, 'already apply');
		apply = await ctx.dao.apply.create({ type: 'legion', to: legion._id, rid: ctx.role._id });
		// 推送消息给军团官员
		const members = legion._members || [];
		const applyer = ctx.role.i();
		members.filter(item => item.pos > 0).forEach(item => {
			pushClient(item.rid, { type: 'legion_apply', content: applyer });
		})
	}
	ctx.body = result;
}
