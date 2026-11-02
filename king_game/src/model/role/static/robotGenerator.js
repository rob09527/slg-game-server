
'use strict'

module.exports = exports = function (config) {
	let tmp = {battleset: {team: {}}};
	if (!config) return tmp;
	tmp.rname = config.NAME;
	tmp.power = config.POWER;
	tmp.iconid = config.ICON;
	tmp.frameid = 51001; // hardcode
	tmp.level = config.LV;
	tmp.vip = 0;

	let teamlist = config.TEAMLIST;
	// 兼容旧配置
	if (!teamlist) teamlist = [config.GENERALS];
	if (!teamlist) return;
	const max_gsid = {
		id: '',
		power: 0
	}
	tmp.battleset = teamlist.map(generals =>{
		let team = {};
		for (let general of generals) {
			let cond = {
				gsid: general.ID,
				level: general.LV,
				class: general.CLASS,
			}
			let g = new this.db.models.general(cond);
			g = g.base();
			if (general.HP) {
				g.property.hp = general.HP;
			}
			if(g.power > max_gsid.power) {
				max_gsid.id = g.gsid;
				max_gsid.power = g.power;
			}
			delete g.guid;
			team[general.POS] = g;
		}
		return {team};
	});
	tmp.imageid = max_gsid.id;
	// 兼容旧配置
	if (config.GENERALS) tmp.battleset = tmp.battleset[0];

	return tmp;
}
