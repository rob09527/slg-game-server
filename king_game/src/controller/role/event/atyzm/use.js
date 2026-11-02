'use strict';

const debug = require('debug')('event:atyzm:use');

// 活动招募
module.exports = async function(ctx, next) {
    let { actIndex = 0 } = ctx.request.body;
	let mode = `atyzm${actIndex}`
    if(actIndex == 0) mode = "atyzm";
    ctx.actIndex = actIndex
	ctx.config = global.gameconfig.zhd_newhero[mode.toUpperCase()];
    debug({mode})
    debug(ctx.config)
	ctx.assert(ctx.config, "invalid actIndex");
	ctx.assert(ctx.zhdpoint("ISZHD", mode), "fn freeze")
    await next();
}