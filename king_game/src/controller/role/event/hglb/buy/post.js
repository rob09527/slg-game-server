"use strict"

module.exports = async function (ctx, next) {
    let { index, platform, bundle, channel, version } = ctx.request.body;

    index = parseInt(index);
    index = ctx.config.ITEMS.findIndex(value=>value.INDEX == index);
	ctx.assert(index > -1, 'invalid index'+index);
	let info = ctx.config.ITEMS[index];
	ctx.assert(info, 'invalid info'+index);
	let bought = ctx.record[index] || 0;
	ctx.assert(info.LIMIT > bought,'limit'+index)
    let param = {
        platform,
        bundle,
        channel,
        version,
        uid: ctx.role.uid,
        rid: ctx.role.i(),
        servid: ctx.role.servid,
		pid:[ctx.KEY, index].join("_"),
		price: info.PRICE,
    }
    const { data } = await ctx.orderReq(param);
    ctx.assert(!data.error, data.error);
    ctx.body = data;
}