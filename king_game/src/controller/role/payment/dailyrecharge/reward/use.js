
'use strict'

module.exports = async (ctx, next) => {
	let {
		amount: k_amount,
	} = ctx.request.body;
	k_amount = 'recharge' + k_amount;
	const {
		REWARDS,
		REWARD_POOL,
	} = global.gameconfig.dailyrecharge_reward;
	ctx.config = REWARDS[k_amount];
	ctx.assert(ctx.config, 'invalid amount');
	// clone
	ctx.config = JSON.parse(JSON.stringify(ctx.config));
	// 获取奖励池
	ctx.config.POOLS = ctx.config.POOLS.map(({ID, LIMIT}) =>{
		const pool = REWARD_POOL[ID];
		ctx.assert(pool, 'invalid poolid');
		return {
			POOL: pool,
			LIMIT,
		}
	})
	await next()
}