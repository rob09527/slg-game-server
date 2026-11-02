"use strict"

const { pid } = require("process");

module.exports = async function(ctx, next) {
	const config = global.gameconfig.recharge[ctx.request.body.pid];
	ctx.assert(config, 'invalid product');
	ctx.request.body.price = config.PRICE;
    let prefix = ctx.request.body.pid.replace('special', '');
    prefix = prefix.split("_");
    for (let i = prefix.length > 2 ? 1 : 0; i <= prefix.length - 2; i++) {
        const endtime = ctx.role.special[prefix[i]] || 0;
        ctx.assert(endtime < Date.now(), 'not expire');
    }
	ctx.request.body.uid = ctx.role.uid;
	ctx.request.body.rid = ctx.role.i();
	ctx.request.body.servid = ctx.role.servid;
	const {data} = await ctx.orderReq(ctx.request.body);
	ctx.assert(!data.error, data.error);
	ctx.body = data.data;
}