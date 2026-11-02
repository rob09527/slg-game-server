
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.body = {};
	let {
		list,
	} = ctx.request.body;
	let mails = [];
	let config = global.gameconfig.pvpteamrewardseason;
	for (let {teamid, rank} of list) {
		let team = await ctx.dao.pvpteam.findOne({_id: teamid});
		if (!team) continue;
		// 根据排名发放奖励
		rank++;
		for (let {MAX, ITEMS} of config) {
			if (rank > MAX) continue;
			// 给每个队员发奖励邮件
			console.log('PVPTEAMSEASONREWARD', teamid, team.name, team.servid, rank);
			console.log(ITEMS);
			for (let {rid} of team.fellows) {
				console.log('PVPTEAMMR', teamid, rid);
				mails.push({
					type: 2, rid,
					title: ctx.textgetter('PVPTEAMREWARDSEASONT'),
					content: ctx.textgetter('PVPTEAMREWARDSEASONC', team.name, rank),
					reward: ITEMS,
				})
			}
			break;
		}
	}
	await global.dao.mail.insertMany(mails);
	// 清空本组组队
	// await global.dao.pvpteam.remove({});
	// 清空角色小队标记
	await global.dao.role.updateMany({},{$unset:{teamid: 1}});
	// 清空人物身上的对应阵容
	let cond = {
		'battlearr.teampvp': {$exists: 1}
	}
	let udp = {
		$unset:{
			'battlearr.teampvp': 1
		}
	}
	await global.dao.role.updateMany(cond, udp);
	// 清空武将身上的阵容标记
	cond = {
		'battleset.teampvp': {$exists: 1}
	}
	udp = {
		$unset: {
			'battleset.teampvp': 1
		}
	}
	await global.dao.general.updateMany(cond, udp);
	// 异步删除录像
	global.dao.video.remove({type: 'teampvp'}).catch(console.error);
}