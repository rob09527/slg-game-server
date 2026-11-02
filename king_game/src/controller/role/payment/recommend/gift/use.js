
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert( ctx.request.body.type , 'miss type');
	ctx.gift_type =  ctx.request.body.type +  (ctx.request.body.limit || '');

	ctx.IS_BATCH = ctx.is_batch(ctx.gift_type); // BATCH开头的推荐礼包为多档次同时触发的推荐礼包类型
	const MODEL = ctx.IS_BATCH ? ctx.dao.c_recommp_gift_batch : ctx.dao.c_recommp_gift;
	ctx.gift = await MODEL.findOne({rid: ctx.role._id, type: ctx.gift_type , isBuy: 0, expireAt: {$gte: Date.now() }});

	await next();
}
