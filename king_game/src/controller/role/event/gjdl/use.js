
'use strict'

const modes = [ "gjdl", "hqsd"];

// 挂机掉落-道具掉落 欢庆商店-道具在礼包中配置
module.exports = exports = async function (ctx, next) {
	const { mode = 'gjdl' } = ctx.request.body;
	ctx.assert(modes.includes(mode), "invalid mode");
	const up = mode.toUpperCase();
	const [start, end] = global.config.ZHD[up];
	ctx.assert(Date.in(start, end), 'fn freeze');
	ctx.GJDL = global.gameconfig.zhd[up].ITEMS;
	ctx.mode = mode;
	await next();
}