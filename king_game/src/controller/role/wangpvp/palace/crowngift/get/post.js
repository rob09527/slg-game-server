
'use strict'

const {
	CROWN_REWARD,
} = global.gameconfig.kingdom;

module.exports = exports = async function (ctx, next) {
	// todo 等级限制
	ctx.assert(ctx.role.getProp(90521) === 0, 'already take');
	ctx.assert(ctx.kingdom.kingrid !== ctx.role.i(), 'cant take');
	ctx.role.addItemsNoSave(90521);
	ctx.role.addItemsNoSave(CROWN_REWARD);
	await ctx.role.save();
	ctx.body = {
		rewards: CROWN_REWARD,
	}
}