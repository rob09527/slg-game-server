
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.assert(ctx.TEAM_OPEN, 'no open');
	const {id} = ctx.request.body;
	ctx.assert(!ctx.role.teamid, 'already join');
	const team = await ctx.dao.pvpteam.findOne({_id: id});
	ctx.assert(team.fellows.length < 3, 'team full');
	ctx.assert(ctx.role._power >= team.pneed, 'power limit');
	// 加入跨服组判断
	let mygroup1 = await global.dao.kinggroup.findOne({servid: team.servid});
	let mygroup2 = await global.dao.kinggroup.findOne({servid: ctx.role.servid});
	ctx.assert(mygroup1.groupmark == mygroup2.groupmark, 'group error');
	// 判断申请的队伍是否有自己
	const exist = team.fellows.deepQueryOne('rid', ctx.role.i());
	ctx.assert(!exist, 'our fellow');
	let apply = await ctx.dao.apply.findOne({type: 'teampvp', rid: ctx.role._id, to: id});
	if (!apply) apply = new ctx.dao.apply({type: 'teampvp', rid: ctx.role._id, to: team._id});
	apply.create = Date.now();
	await apply.save();
	ctx.body = {};
}