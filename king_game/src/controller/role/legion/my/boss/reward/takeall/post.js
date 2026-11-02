
'use strict'

const {
	LEGION: {
		BOSS_REWARD_TAKEALL_DAY_LIMIT: DAYLIMIT,
	},
} = global.gameconfig.others;

module.exports = exports = async function (ctx, next) {
	ctx.assert(ctx.role.legionjointime + DAYLIMIT <= Date.now(), '3days later')
	let items = [];
	for (let [i, _items] of Object.entries(ctx.rewards)) {
		ctx.role.lbossrecord[Number.parseInt(i)] = Date.now();
		items.push(..._items);
	}
	items = items.arrange();
	ctx.role.addItemsNoSave(items);
	ctx.role.markModified('lbossrecord');
	await ctx.role.save();
	ctx.body = {rewards: items};
}