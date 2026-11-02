
/*
	生成战斗阵容所有数据
	@param team 阵容信息,必须传入
 */

'use strict'

module.exports = function (team, tutor) {
	team = this.getTeamset(team);
	let mythic = this.getMythical(tutor);
	return {
		team,
		mythic,
	}
}