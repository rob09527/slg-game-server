
'use strict'

module.exports = exports = function (chapter_index, buffid) {
	let config = global.gameconfig.dgbuffs[chapter_index].deepQueryOne('BUFFID', buffid);
	if (!config) return;
	let {
		ATTR: attr,
		VAL: val,
		LIMIT,
	} = config;
	attr = attr.toLowerCase();
	if (LIMIT) { // 有战斗次数限制增益
		this._buff.battle.push({
			attr,
			val,
			limit: config.LIMIT,
		})
		this.markModified('_buff.battle');
	}else{ // 一直持续增益
		let cur_val = this._buff.default[attr] || 0;
		cur_val += val;
		this._buff.default[attr] = cur_val;
		this.markModified('_buff.default');
	}
}