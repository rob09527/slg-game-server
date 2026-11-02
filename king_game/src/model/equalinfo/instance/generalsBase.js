
/*
	生成武将战斗用数据
	rate ∈ [1, 0]
 */

'use strict'

module.exports = function (generals, rate = 0) {
	generals = generals || this.generals;
	return generals.map(gsid => {
		gsid = Number.parseInt(gsid);
		let general = global.dao.general.newGeneralNoSave('nobody', gsid);
		general = general.base();
		let config = global.gameconfig.equalgeneral.deepQueryOne('GSID', gsid);
		if (!config) return gsid;
		general.class = config.CLASS;
		general.level = config.LV;
		general.des = config.DESC;
		for (let [key, val] of Object.entries(config.ATTRS)) {
			if (key === 'HP' || key === 'ATK') val = Math.trunc(val * (1 + rate));	// 攻血系数加成
			general.property[key.toLowerCase()] = val;
		}
		let rm_keys = [
			'equip',
			'soul',
			'occusuitskill',
			'create',
			'issoul',
			'_ownerlevel',
			'guid',
			'inherit',
			'exclusive',
			'horse',
			'pet',
		]
		for (let key of rm_keys) {
			delete general[key];
		}
		return general;
	})
}