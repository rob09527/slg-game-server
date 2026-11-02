/*
 设置阵容顺序,根据传入的顺序,例[2, 1, 3]将阵容type1,2,3重新赋值
 同步更新阵容战力
*/


'use strict'

const assert = require('assert');

module.exports = exports = async function (type = '', teamorder = []) {
	// 获取所有阵容信息阵容战力
	let battleset_list = [];
	for (let i = 1; i <= 3; i++) {
		let key = `${type}${i}`;
		let battleset = this.battlearr[key];
		if (!battleset) break;
		battleset_list.push({
			battleset,
			power: this._powerbattleset[key] || 1,
		})
	}
	// 按设定顺序保存
	for (let i = 1; i <= teamorder.length; i++) {
		let index = Number.parseInt(teamorder[i - 1]);
		let info = battleset_list[index - 1];
		assert(info, 'battleset nexist');
		let key = `${type}${i}`;
		this.battlearr[key] = info.battleset;
		this._powerbattleset[key] = info.power;
	}
	this.markModified('battlearr');
	this.markModified('_powerbattleset');
	await this.save();
}