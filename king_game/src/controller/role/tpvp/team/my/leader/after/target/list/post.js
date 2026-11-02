
'use strict'

const TARGETS = [
	{score: {$gte: 0.9}},
	{score: {$gte: 0.8, $lte: 1.2}},
	{power: {$gte: 0.5, $lte: 0.9}},
]

module.exports = exports = async function (ctx, next) {
	let {
		force
	} = ctx.request.body;
	// 请求目标列表
	let {list} = await ctx.team.fetchTarget(force);
	let tmp = [];
	for (let {teamid, servid, score} of list) {
		if (teamid.startsWith('robotteam')) {	// 机器人队伍,自行生成
			let [, index] = teamid.split('_');
			let team = ctx.dao.pvpteam.robotteam(index);
			team.id = teamid;
			team.servid = ctx.team.servid;
			tmp.push(team);
		}else{
			// 请求队伍信息
			let team = await ctx.dao.pvpteam.findOne({_id:teamid})
			team = await team.base();
			// 删除体力字段,增加积分字段
			if (team.competition) {
				team.competition.teamscore = score;
				delete team.competition.stamina;
			}
			tmp.push(team);
		}
	}
	ctx.body = tmp;
}