
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.rewards = {};
	// 军团最高
	let maxindex = ctx.playerchapter ? global.gameconfig.legionboss.length: ctx.boss.index;
	for (let i = 0; i < maxindex; i++) {
		let {
			KITEMS,
		} = global.gameconfig.legionboss[i];
		let is_finish = ctx.role.lbossrecord[i];
		if (is_finish) continue;
		ctx.rewards[i] = KITEMS;
	}
	await next();
}