
'use strict'
// 夺宝活动-机关傀儡
module.exports = exports = async function (ctx, next) {
    ctx.assert(ctx.zhdpoint("ISZHD", "jgkl"), "not open");
	await next();
}