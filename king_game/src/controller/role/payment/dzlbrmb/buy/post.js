
'use strict'
const rechange = require('../../../../../remote/recharge/post');

module.exports = exports = async function (ctx, next) {
	let {
		platform,
		bundle,
		channel,
		version,
		id,
		optionindex,
	} = ctx.request.body;
	let config = global.gameconfig["dzlbrmb"+ctx.key].deepQueryOne('ID', Number.parseInt(id));
	ctx.assert(config, 'invalid id');
	let dzlbrmbData = ctx.role["dzlbrmb"+ctx.key] || {} ;
	let buytime = dzlbrmbData[id] || 0;
	ctx.assert(buytime < config.LIMIT, 'no more');
	let optionExist = optionindex.every((choice, index) =>{
		let poolId = config.CHOICE[index];
		if (!poolId) return false;
		let pool = global.gameconfig["dzlbchoicermb"+ctx.key][poolId];
		if (!pool) return false;
		return !!pool[choice];
	})
	ctx.assert(optionExist, 'choice nexist');
	optionindex = [
		'dzlbrmb'+ctx.key,
		id,
		...optionindex
	]
	let pid = optionindex.join('_');
	if (config.PRICE === 0) {
		ctx.request.body.rid = ctx.role.i();
		ctx.request.body.pid = pid;
		await rechange(ctx,next);
		ctx.body = {direct: 1}
		return;
	}
	let info = {
		platform,
		bundle,
		channel,
		version,
		pid,
		price: config.PRICE,
		uid: ctx.role.uid,
		rid: ctx.role.i(),
		servid: ctx.role.servid,
	}
	let {data} = await ctx.orderReq(info);
	ctx.assert(!data.error, data.error);
	ctx.body = data;
}