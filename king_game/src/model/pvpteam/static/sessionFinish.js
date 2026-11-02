const tg = require('../../../util/textgetter');

// 组队演武赛季结算
module.exports = async function (body) {
    let {
        list
    } = body;
    let mails = [];
	let config = global.gameconfig.pvpteamrewardseason;
	for (let {teamid, rank} of list) {
		let team = await global.dao.pvpteam.findOne({_id: teamid});
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
					title: tg('PVPTEAMREWARDSEASONT'),
					content: tg('PVPTEAMREWARDSEASONC', team.name, rank),
					reward: ITEMS,
				})
			}
			break;
		}
	}
	await global.dao.mail.insertMany(mails);
    
}
