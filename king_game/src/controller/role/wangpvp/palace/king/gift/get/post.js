
'use strict'

const _ = require('lodash');

const {
	GIFT,
	GIFT_REF_CAST,
} = global.gameconfig.kingdom;

module.exports = exports = async function (ctx, next) {
	let {
		force,
	} = ctx.request.body;
	if (ctx.kingdom.pregift.rewards.length < 1 || force) {
		// 强制刷新消耗
		if (force) {
			let cast = GIFT_REF_CAST[ctx.kingdom.pregift.refcount];
			if (!cast) cast = _.last(GIFT_REF_CAST);
			ctx.role.castItemsNoSave(cast);
			await ctx.role.save();
		}
		let rates = GIFT.deepMap('W');
		let rewards = GIFT[ctx.random.inweight(rates)].REWARDS;
		let udp = {
			$set: {
				'pregift.rewards': rewards,
			},
			$inc: {
				'pregift.refcount': 1,
			}
		}
		await ctx.kingdom.updateOne(udp);
		//TODO 更新缓存
		ctx.kingdom.pregift.rewards = rewards;
	}
	ctx.body = {
		times: ctx.kingdom.pregift.refcount,
		rewards: ctx.kingdom.pregift.rewards,
	}
	if (ctx.kingdom.pregift.is_send) ctx.body.issend = 1;
}