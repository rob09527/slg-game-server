'use strict'
/**
 * 点金手
 */
module.exports = exports = async function (ctx, next) {
    

    const isNewZhd = ctx.role.isXS('xs_djs');
	let toUp =  isNewZhd ? 'xs_djs': 'djs';
    ctx.assert(ctx.zhdpoint("ISZHD", toUp), 'fn freeze');

	toUp = isNewZhd ? ctx.role.isXSConKey(toUp).toUpperCase():toUp.toUpperCase();
    
    let { type } = ctx.request.body;
    ctx.type = (parseInt(type) || 1) - 1;
    ctx.config = global.gameconfig.zhd[toUp] || global.gameconfig.zhd_newhero[toUp];
    ctx.assert(ctx.config, 'config not exist');
   
    await next();
}