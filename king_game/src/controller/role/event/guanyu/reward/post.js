/**
 * 奖励领取
 */

'use strict'

const C_TYPE = [
	0,
	'special.gz',
	'special.zz',
]

module.exports = async ctx => {
	let {
		index = 0,
	} = ctx.request.body;
	ctx.assert(!ctx.record.rewardtime[index], 'already toke');
	let data = await ctx.record.rewardstatus(ctx.role.get('special.gz'), ctx.role.get('special.zz'));
	data = data[index];
	ctx.assert(data.status === 1, 'lv limit');
	let $set = {
		[`rewardtime.${index}`]: Date.now(),
		[`status.${index}`]: 2, // 已领取
	}

	// 
	ctx.record.rewardtime[index] = Date.now();
	let {
		REWARD,
	} = global.gameconfig.guanyu;
	// 判断是否已经全部领取了
	if (ctx.record.rewardtime.filter(elem => elem).length >= REWARD.length) {
		$set.expireAt = Date.now(); // 立即修改结束时间，为了前端处理按钮隐藏
	}

	await ctx.record.updateOne({ $set });
	ctx.role.addItemsNoSave(data.items);
	await ctx.role.save();
	ctx.body = {
		items: data.items,
	}
}