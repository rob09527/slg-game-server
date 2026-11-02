"use strict"

// 活动福袋购买
module.exports = async function(ctx, next) {

    const { FUDAIS } = ctx.config;
    let {index, platform, bundle, channel, version, myselect} = ctx.request.body;
	index = parseInt(index);
	let info = FUDAIS[index];
	ctx.assert(info, 'invalid index');
	// 是否已解锁该福袋
	ctx.assert(index <= ctx.hdData.buyindex, 'not unlock');

	let bought = ctx.hdData.buycount[index] || 0;
	// 是否超出限购
	ctx.assert(bought < info.LIMIT, 'no more');

	// ctx.KEY 的内容包含了 '_', 如: YD_HYFD
	let pid = ['fudai', ctx.hdType, index].join('_');
	let param = {
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
	const { data } = await ctx.orderReq(param);
	ctx.assert(!data.error, data.error);
	ctx.body = data;
}