
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {level = 1} = ctx.request.body;
	let exp = 0;
	let config = global.gameconfig.legionlevel;
	for (let i = 0; i < config.length && i < level; i++) {
		let info = config[i];
		if (!info) break;
		exp += info.EXP;
	}
	ctx.legion._exp = exp;
	await ctx.legion.save();
	ctx.body = {};
}