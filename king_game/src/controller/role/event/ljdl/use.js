'use strict'

const modes = [
	"ljdl", // 累计登录
	"ljdl1", // 累计登录1 	
	"dlhl", // 登录豪礼 
	"dlhl1", // 登录豪礼1
];

// 累计登录
module.exports = async function(ctx, next) {
	const { mode = "ljdl" } = ctx.request.body;
	ctx.assert(modes.includes(mode), "invalid mode");
	const up = mode.toUpperCase();
    let [start, end] = global.config.ZHD[up] || [];
	ctx.assert(Date.in(start, end), 'fn freeze');
	ctx.mode = mode;
	ctx.config = global.gameconfig.zhd_newhero[up];
	await next();
}