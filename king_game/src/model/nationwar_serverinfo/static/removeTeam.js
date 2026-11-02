
'use strict'

const assert = require('assert');
// 国战-移除玩家某一小队的队伍
module.exports = async function (servid, uid, areamark, set, index,teamid) {
	const info = await this.findOne({ areamark }, { [set]: 1 });
	if (!info) return [];
	let teamInfo = info[set];
	let result = [];
	if (index) {
		// 有前后军
		// 左军或者右军
		let _index = teamInfo[index].findIndex(data => data.servid == servid && data.uid == uid && data.teamid == teamid);
		if (_index != -1) {
			// 移除队伍信息
			result = teamInfo[index].splice(_index, 1);
		}
	} else {
		let _index = teamInfo.findIndex(data => data.servid == servid && data.uid == uid && data.teamid == teamid);
		if (_index != -1) {
			// 移除队伍信息
			result = teamInfo.splice(_index, 1);
		}
	}
	await this.updateOne({ areamark }, { $set: { [set]: teamInfo } })

	return result;
}
