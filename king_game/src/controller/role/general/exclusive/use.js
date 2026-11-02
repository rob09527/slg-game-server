
'use strict'
// 武将专属
module.exports = exports = async (ctx, next) =>{
	const config = global.gameconfig.general[ctx.general.gsid];
	ctx.CONFIG = global.gameconfig.generals_exclusive.CONFIG[config.OCCU]; // 获取主职业的专属配置

	ctx.assert(ctx.general.star >= global.gameconfig.generals_exclusive.UNLOCK_STAR, 'exclusive luck' );
	ctx.assert(ctx.CONFIG, 'miss exclusive config' );
	await next();
}
