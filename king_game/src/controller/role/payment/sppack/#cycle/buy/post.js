
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.cache, 'invalid cache');
	const index = parseInt(ctx.request.body.index);
	const item = ctx.cache.items[index];
	ctx.assert(item.buytime > 0, 'no more');
	const info = {
		platform: ctx.request.body.platform,
		bundle: ctx.request.body.bundle,
		channel: ctx.request.body.channel,
		version: ctx.request.body.version,
		pid: ['spp', ctx.params.cycle ,index].join('_'),
		price: item.price,
		uid: ctx.role.uid,
		rid: ctx.role.i(),
		servid: ctx.role.servid,
	}
	const {data} = await ctx.orderReq(info);
	ctx.assert(!data.error, data.error);
	ctx.body = data;
}