
'use strict'

const {
	MOBAI_REWARD,
} = global.gameconfig.kingdom;

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.role.getProp(90523) === 0, 'already take');
	ctx.assert(ctx.kingdom.kingrid !== ctx.role.i(), 'cant take');
	let rewards = MOBAI_REWARD.map(item =>{
		let {
			GSID,
			MINCOUNT,
			MAXCOUNT,
			LVR,
		} = item;
		let COUNT = Math.floor(ctx.random.between(MINCOUNT, MAXCOUNT) + ctx.role.level * LVR);
		return {
			GSID,
			COUNT,
		}
	})
	ctx.role.addItemsNoSave(90523);
	ctx.role.addItemsNoSave(rewards);
	await ctx.role.save();
	ctx.body = {
		rewards,
	}
}