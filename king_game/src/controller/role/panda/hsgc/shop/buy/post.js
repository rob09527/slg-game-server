
'use strict'

const recharge = require("../../../../../../remote/recharge/post");

module.exports = exports = async function (ctx, next) {
    let {
		platform,
		bundle,
		channel,
		version,
		stage,
		index,
	} = ctx.request.body;
    ctx.assert(ctx.mongoFind.stage >= stage, '132');
    let info = ctx.CONFIG.shop[ctx.CACHE.id][stage];
    ctx.assert(info, '133');
	index = info.findIndex(value=>value.INDEX == index);
    info = info[index];
    ctx.assert(info, '134');
    ctx.assert(ctx.role.getProp(info.MARK) < info.LIMIT, '135');
	let pid = [ctx.KEY, stage, index, ctx.FIELD].join('_');
    if (info.COST) {
        ctx.assert(ctx.role.getProp(info.COST.GSID) >= info.COST.COUNT,'136');
        ctx.role.castItemsNoSave([info.COST]);
		ctx.request.body.rid = ctx.role.i();
		ctx.request.body.pid = pid;
        await recharge(ctx, next);
		ctx.body = {direct: 1}
		ctx.save = false;
        return;
    }
	let rechargeInfo = {
		platform,
		bundle,
		channel,
		version,
		pid,
		price: info.PRICE,
		uid: ctx.role.uid,
		rid: ctx.role.i(),
		servid: ctx.role.servid,
	}
	let {data} = await ctx.orderReq(rechargeInfo);
	ctx.assert(!data.error, data.error);
	ctx.body = data;
}