
'use strict'

module.exports = exports = async function (ctx, next) {
	ctx.assert(!ctx.kingdom.pregift.is_send, 'already send');
	let rewards = ctx.kingdom.pregift.rewards;
	let gifts = {
		$each: [
			{
				rewards,
				endtime: Date.now() + 24 * 60 * 60 * 1000,
			},
		],
		$sort: {
			endtime: -1,
		},
	}
	let $set = {
		'pregift.is_send': Date.now(),
	}
	await ctx.kingdom.updateOne({$push: {gifts}, $set});
	//TODO 更新缓存
	rewards = rewards.map(({GSID, COUNT}) => {
		return {
			GSID,
			COUNT: COUNT * 2,
		}
	})
	ctx.role.addItemsNoSave(rewards);
	ctx.role.missionInvoke('WANG_GIFT_GET');
	await ctx.role.save();
	ctx.body = {
		rewards,
	};
	// 全服推送
	global.remote.pushClientAll(ctx.role._gameserv.groupid,{
		type: 'kinggift',
		content: {},
	});
}
