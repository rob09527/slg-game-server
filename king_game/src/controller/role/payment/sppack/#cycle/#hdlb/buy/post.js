
'use strict'

module.exports = exports = async function (ctx, next) {
	let {hdlb = 'unknow'} = ctx.params;
	let {index, platform, bundle, channel, version,myselect} = ctx.request.body;
	index = parseInt(index);
	let info = ctx.config[index];
	ctx.assert(info, 'invalid index');
	let bought = ctx.role[hdlb][index] || 0;
	ctx.assert(bought < info.LIMIT, 'no more');
	let pid = [ctx.KEY.toLowerCase(), index].join('_')
	if (hdlb == 'cjxg2' || hdlb == 'cjxg3') {
		// 这两个礼包多了一个自选奖励的下标
		pid = [ctx.KEY.toLowerCase(), index,myselect].join('_')
	}
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
	const {data} = await ctx.orderReq(param);
	ctx.assert(!data.error, data.error);
	ctx.body = data;
}
