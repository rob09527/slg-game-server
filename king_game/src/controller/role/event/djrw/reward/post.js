
'use strict'


module.exports = exports = async function (ctx, next) {
	let {
		index,
	} = ctx.request.body;
	const {
		MISSIONS,
	} = ctx.config;

	index = Number.parseInt(index);
	let mission = MISSIONS[index];
	ctx.assert(mission, 'mission nexist');
	let {
		MARK,
		CHK,
		ITEMS,
	} = mission;
	ctx.assert(ctx.role.getItems(MARK).count <= 0, 'already token');
	let fullfill = CHK.every(({MARK, NUM}) =>{
		return ctx.role.getItems(MARK).count >= NUM;
	})
	ctx.assert(fullfill, 'not finish');
	let items = [
		{GSID: MARK, COUNT: 1},
		...ITEMS
	]
	ctx.role.addItemsNoSave(items);
	await ctx.role.save();
	ctx.body = items;
	// 周活动日志-点将任务
	if(!ctx.isRemind) ctx.zhdprint(ctx.KEY, index + 1);
}
