
'use strict'

module.exports = exports = async function (ctx, next) {
	const {id: _id, name, no: teamno} = ctx.request.body;
	let team, cond;
	if (teamno) cond = {teamno};
	if (name) cond = {name};
	if (_id) cond = {_id};
	// 加入跨服组判断
	let mygroup = await global.dao.kinggroup.findOne({servid: ctx.role.servid});
    const _list = await global.dao.kinggroup.find({groupmark: mygroup.groupmark});
    let $in =  _list.map(({servid}) => servid);
	cond.servid = {$in}
	
	team = await ctx.dao.pvpteam.findOne(cond);
	ctx.assert(team, 'invalid teamid');
	ctx.body = await team.base();
	// 准备后的队伍查询体力及积分
	if (!ctx.body.competition) return;
	ctx.body.competition.time = team._sta.last;
	// 返回队伍分数和上次计分时间
	ctx.body.competition.teamscore = team.score;
	ctx.body.competition.last = team.last;
}