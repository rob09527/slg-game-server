
'use strict'
const { ROBOT } = global.gameconfig.ring_rank;
/**
 * 获取阵容
 * @return {Promise<[]>}
 */
module.exports = exports = async function () {
	let bset;
	if (this.robot_id) { // 机器人阵容 走配置
		bset = ROBOT[this.robot_id] ? ROBOT[this.robot_id].BSET : {};
	} else {
		let role = await global.dao.role.findOne({ _id: this.rid }, { servid: 1, uid: 1 });
		let roleinfo = await global.dao.role.getOtherInfoAndBattleSet({ uid: role.uid, servid: role.servid }, 'ringpvp');
		bset = roleinfo.battleset;
	}
	return bset;
}
