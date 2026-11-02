
'use strict'

module.exports = exports = async function (ctx, next) {
	let cond = {
		type: 'teampvp',
		rid: ctx.team._id
	}
	let list = await ctx.dao.video.find(cond, {video: 0}).sort({_id: -1}).limit(10);
	list = list.map(video =>{
		let [result, score, change, servid, teamid] = video.mark.split('.');
		return {
			result,
			change,
			servid,
			teamid,
			videoid: video._id.toString(),
			time: video.time,
			version: video.version,
			type: 'teampvp',
		}
	})
	let tmp = [];
	for (let v of list) {
		let {
			servid,
			teamid,
		} = v;
		if (teamid.startsWith('robotteam')) {
			let [, index] = teamid.split('_');
			v.teaminfo = ctx.dao.pvpteam.robotteam(index);
			v.teaminfo.id = teamid;
			v.teaminfo.servid = ctx.team.servid;
		}else{
			let p_team = await ctx.dao.pvpteam.findOne({_id: teamid});
			if (!p_team) continue;
			v.teaminfo = await p_team.base();
		}
		tmp.push(v);
	}
	ctx.body = tmp;
}