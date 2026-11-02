
'use strict'

module.exports = exports = async (ctx, next) => {
	const [start, end] = global.config.ZHD.JYBP;
	ctx.assert(Date.in(start, end), 'fn freeze');
	if (!ctx.role.jybp || (ctx.role.jybp && Object.keys(ctx.role.jybp).length == 0)) {
		// 初始化 记录游戏ID 以及 最小步数
		ctx.role.jybp = {
			minStep: 0,
			rememberid: 0
		}
	}
	await next();
}