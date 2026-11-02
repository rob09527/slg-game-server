
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		uid,
		servid,
	} = ctx.request.body;
	let role = await ctx.dao.role.findOne({uid: uid});
	ctx.assert(role, 'role nexist');
	ctx.body = {
		rno: role.rno,
		name: role.name,
		iconid: role.iconid,
		headid:role.headid,
		frameid: role.frameid,
		level: role.level,
	}
	ctx.body.battleset = await role.getBattleSet('kingpvp');
	ctx.body.power = role._powerbattleset.kingpvp;
	if (role.legion) {
		let legion = await ctx.dao.legion.findOne({_id: role.legion}, {name: 1});
		if (legion) ctx.body.legion = legion.name;
	}
}