
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		id,
	} = ctx.request.body;

	let gift = ctx.kingdom.gifts.deepQueryOne('id', id);
	// 礼包不存在
	ctx.assert(gift, 'invalid giftid');
	// 礼包过期
	ctx.assert(gift.endtime > Date.now(), 'expired gift');
	// 已经领取
	ctx.assert(!gift.roles.includes(ctx.role.i()), 'already take');
	// 国王不能领取
	ctx.assert(ctx.kingdom.kingrid !== ctx.role.i(), 'cant take');
	let cond = {
		_id: ctx.kingdom._id,
		'gifts.id': id,
	}
	let $push = {
		'gifts.$.roles': ctx.role.i(),
	}
	await ctx.dao.c_kingdom.updateOne(cond, {$push});
	//TODO 更新缓存
	ctx.role.addItemsNoSave(gift.rewards);
	ctx.role.missionInvoke('WANG_GIFT_GET');
	await ctx.role.save();
	ctx.body = {
		rewards: gift.rewards,
	}
}