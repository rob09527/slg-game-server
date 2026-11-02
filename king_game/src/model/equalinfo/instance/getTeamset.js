
/*
	生成战斗阵容数据
 */

'use strict'

module.exports = function (team, rate) {
	team = team || this.team || {};
	let generals = this.generalsBase(Object.values(team), rate);
	let tmp = {};
	for (let [pos, gsid] of Object.entries(team)) {
		let g = generals.deepQueryOne('gsid', Number.parseInt(gsid));
		if (!g) continue;
		tmp[pos] = g;
	}
	return tmp;
}