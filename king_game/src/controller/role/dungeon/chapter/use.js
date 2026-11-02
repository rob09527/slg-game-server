
'use strict'

module.exports = exports = async (ctx, next) =>{
	// 检查是否设置出战武将
	ctx.assert(ctx.dginfo, 'generals nexist');
	await next();
}