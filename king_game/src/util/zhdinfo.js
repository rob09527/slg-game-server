
'use strict'
// 周活动信息（招募积分、点将积分、观星达标）

const _ = require('lodash');

module.exports = exports = function (type, ctx) {
	let config = global.gameconfig.zhd[type];
	ctx.assert(config, 'invalid jfhd');
	let {
		MISSIONS,
		MARK,
		LOOPLIMIT,
	} = config;
	let looplimit = LOOPLIMIT[ctx.role.vip];
	let cycleScore = _.last(MISSIONS).NUM;
	// 可计算分限制在可用循环内
	let curScore = ctx.role.getProp(MARK);
	curScore = Math.min(curScore, looplimit * cycleScore);

	let currentloop = Infinity; // 当前正在进行的 loop 值
	MISSIONS.forEach(m => {currentloop =  Math.min(currentloop,  ctx.role.getProp(m.MARK))});
	currentloop = Math.min(currentloop, looplimit);

	let missions = MISSIONS.map(mission => {
		let {
			MARK: rewardMark,
			NUM,
			NAME: name,
			ITEMS: items,
			SELECTITEMS:selectitems,
			SELECTICON:icon
		} = mission;

		let markNum = ctx.role.getProp(rewardMark);
		let thiscur = curScore - Math.min(currentloop, looplimit - 1) * cycleScore;
	 	thiscur = Math.min(thiscur, NUM);

		return {
			cnum: NUM,
			cur: thiscur,
			icon,
			name,
			items,
			selectitems,
			status: (markNum > currentloop || markNum >= looplimit) ? 2: ( thiscur < NUM )? 0 : 1
		}
	});

	ctx.body = {
		looplimit,
		currentloop : Math.min(currentloop, looplimit) ,
		missions,
	}
}
