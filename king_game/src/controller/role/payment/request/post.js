
'use strict'

module.exports = exports = async function (ctx, next) {
	const config = global.gameconfig.recharge[ctx.request.body.pid];
	ctx.assert(config, 'invalid product');
	ctx.request.body.price = config.PRICE;
	if (config.TYPE === 'RIGHT') {	// chk expire
		const prefix = ctx.request.body.pid.replace('special', '');
		const endtime = ctx.role.special[prefix] || 0;
		// 特权检查是否过期
		if (!config.CARD) ctx.assert(endtime < Date.now(), 'not expire');
		if (config.FIRST) {
			const isbought = ctx.role.getItems(config.FIRST.LIMIT).count;
			if (!isbought) ctx.request.body.price = config.FIRST.PRICE;
		}
	}
	ctx.request.body.uid = ctx.role.uid;
	ctx.request.body.rid = ctx.role.i();
	ctx.request.body.servid = ctx.role.servid;
	const {data} = await ctx.orderReq(ctx.request.body);
	ctx.assert(!data.error, data.error);
	ctx.body = data.data;
}
