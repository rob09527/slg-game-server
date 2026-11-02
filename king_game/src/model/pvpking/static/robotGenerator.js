
'use strict'

module.exports = exports = function (config) {
	let tmp = {
		battleset: {
			team: {},
		},
	};
	if (!config) return tmp;
	tmp.rname = config.NAME;
	tmp.power = config.POWER;
	tmp.iconid = config.ICON;
	tmp.level = config.LV;
	tmp.vip = 0;
	for (let general of config.GENERALS){
		const cond = {
			gsid: general.ID,
			level: general.LV,
			class: general.CLASS,
		}
		let g = new this.db.models.general(cond);
		g = g.base();
		delete g.guid;
		tmp.battleset.team[general.POS] = g
	}
	return tmp;
}