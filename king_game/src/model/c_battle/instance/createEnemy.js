
'use strict'

const modteam = require('./../common/modteam');

// 使用此方法后会重新设定season.right
module.exports = exports = function (enemy, hps, ...args) {
	let [vipfactor, levelfactor, floorfactor, stepfactor, exlevel, stepnum] = args;
	// _enemy_type @awko 战斗阵容有可能和 战斗类型不一致
	let { enemy: _enemy, right = 1 } = modteam(this._enemy_type || this.type, enemy, hps, vipfactor, levelfactor, floorfactor, stepfactor, exlevel, stepnum);
	// right 4 battle season
	this.enemy = _enemy;
	this.season.right = right;
	return this;
}
