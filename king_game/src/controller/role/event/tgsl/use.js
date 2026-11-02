
'use strict'
// 天工试炼
module.exports = exports = async function (ctx, next) {
	let [start, end] = global.config.ZHD.TGSL || []
	ctx.assert(Date.in(start, end), 'fn freeze')
	let config = global.gameconfig.battletgslboss
	ctx.assert(config, 'config null')
	let { TGSL: { BOSSID } } = global.gameconfig.zhd
	ctx.bossid = BOSSID
	ctx.bset = config[BOSSID]
	await next();
}