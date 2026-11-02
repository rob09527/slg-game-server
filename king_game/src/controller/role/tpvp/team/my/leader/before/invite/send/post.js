
'use strict'

module.exports = exports = async function (ctx, next) {
	
	ctx.assert(ctx.team.fellows.length < 3, 'team full');

	const {rid} = ctx.request.body;

	const ret = await ctx.dao.role.findOne({_id: rid}, {teamid: 1, servid: 1});
	ctx.assert(ret, 'invalid role');
	ctx.assert(!ret.teamid, 'already join');
	// 加入跨服组判断
	let mygroup1 = await global.dao.kinggroup.findOne({servid: ctx.team.servid});
	let mygroup2 = await global.dao.kinggroup.findOne({servid: ret.servid});
	ctx.assert(mygroup1.groupmark == mygroup2.groupmark, 'group error');
	const cond = {
		type: 'tpinvite',
		rid: ctx.role._id,
		to: rid,
	}
	const udp = {
		mark: ctx.team._id.toString(),
		create: Date.now()
	}
	await ctx.dao.apply.findOneAndUpdate(cond, udp, {upsert: 1});

	ctx.body = {};
}