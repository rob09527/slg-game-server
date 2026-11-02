
'use strict'
// 高级幸运观星活动
module.exports = exports = async function (ctx, next) {
	let {
		XYGX = {FRONTEND: {NORMAL: [], PREMIUM: []}},
	} = { XYGX : global.gameconfig.zhd[ctx.KEY]};
	 
	ctx.body = XYGX;
}