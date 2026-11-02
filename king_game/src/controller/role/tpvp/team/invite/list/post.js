
'use strict'

module.exports = exports = async function (ctx, next) {
	const list = await ctx.dao.apply.find({type: 'tpinvite', to: ctx.role._id});
	let tmp = [];
	for (const ret of list) {
		const {rid, mark: teamid} = ret;
		const team = await ctx.dao.pvpteam.findOne({_id: teamid});
		if (!team) continue;
		const role = await ctx.dao.role.findOne({_id: rid});
		if (!role) continue;
		tmp.push({
			id: ret._id.toString(),
			rid,
			rname: role.name,
			power: role._power,
			iconid: role.iconid,
			headid: role.headid,
			frameid: role.frameid,
			tname: team.name,
		})
	}
	ctx.body = tmp;
}