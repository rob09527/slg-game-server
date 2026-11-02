
'use strict'

module.exports = exports = async function (ctx, next) {
	const config = global.gameconfig.ssppacklevel.deepQueryOne('LEVEL', parseInt(ctx.request.body.level));
	ctx.assert(config, 'invalid level');
	const index = global.gameconfig.ssppacklevel.indexOf(config);
	const cache = ctx.role.ssppack.level[index];
	ctx.assert(cache, 'not start');
	ctx.assert(cache.bt >= 1, 'no more');
	ctx.assert(cache.end > Date.now(), 'pack timeout');
	const info = {
		platform: ctx.request.body.platform,
		bundle: ctx.request.body.bundle,
		channel: ctx.request.body.channel,
		version: ctx.request.body.version,
		pid: ['sspp', 'level' ,index].join('_'),
		price: config.PRICE,
		uid: ctx.role.uid,
		rid: ctx.role.i(),
		servid: ctx.role.servid,
	}
	const {data} = await ctx.orderReq(info);
	ctx.assert(!data.error, data.error);
	ctx.body = data;
}