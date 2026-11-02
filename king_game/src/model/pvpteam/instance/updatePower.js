
'use strict'

//const commonsend = require('./../../../util/commonsend');

module.exports = exports = async function () {
	let total = 0;
	for (let {rid} of this.fellows) {
		let player = await this.db.models.role.findOne({_id: rid});
		if (!player) continue;
		total += player._powerbattleset.teampvp || 0;
	}
	// if (this.ready && total != this.power) {
	// 	let params = {
	// 		servid: this.servid,
	// 		teamid: this.i(),
	// 		power: total,
	// 	}
	// 	// 异步发送更新战力请求
	// 	commonsend('/pvpteam/update', params).catch(console.error);
	// }
	this.power = total;
	this.save();
}