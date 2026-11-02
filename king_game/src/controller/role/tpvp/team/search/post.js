
'use strict'

module.exports = exports = async function (ctx, next) {
	// 需要排除掉非同一个跨服组的
	let mygroup = await global.dao.kinggroup.findOne({servid: ctx.role.servid});
    const _list = await global.dao.kinggroup.find({groupmark: mygroup.groupmark});
    let $in =  _list.map(({servid}) => servid);
	const cond = {
		'competition.stamina': {$exists: 0},
		'fellows.2': {$exists: 0},
		'servid':{$in}
	}
	
	let teams = await ctx.dao.pvpteam.find(cond, {_id: 1});
	teams.shuffle();
	let tmp = [];
	for (const doc of teams) {
		if (tmp.length >= 20) break;
		let team = await ctx.dao.pvpteam.findOne({_id: doc._id});
		if (!team) continue;
		team = await team.base();
		tmp.push(team);
	}
	ctx.body = tmp;
}