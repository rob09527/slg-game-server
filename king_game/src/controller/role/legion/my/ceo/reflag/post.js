
'use strict'

/**
 * 军团战旗修改
 * @author awko
 * @type {exports}
 */
module.exports = exports = async (ctx, next) =>{
	let {flag} = ctx.request.body;

	const legionFlag = global.gameconfig.legionflag;
	ctx.assert(legionFlag[flag]  , 'flag Invalid');

	ctx.assert( legionFlag[flag].LEVEL_LIMIT <= ctx.legion.level, 'flag lv limit');

	ctx.legion.flag = flag;
	await ctx.legion.save();
	ctx.body = ctx.legion.base();
}
