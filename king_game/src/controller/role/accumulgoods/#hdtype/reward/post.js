
'use strict'

module.exports = exports = async (ctx, next) => {
    const { index } = ctx.request.body;
    ctx.assert(!ctx.record.rewardtime[index], 'already toke');

	let data = await ctx.record.rewardstatus();
	data = data[index];
	ctx.assert(data.status == 1, 'cond limit');

	let $set = {}
	if(!Array.isArray(ctx.record.rewardtime)&& ctx.record.rewardtime.length < 1) {
		$set.rewardtime = [];
		$set.rewardtime[index] = Date.now();
	}
	else{
		$set[`rewardtime.${index}`] = Date.now();
	}

	await ctx.record.updateOne({ $set });
	ctx.role.addItemsNoSave(data.items);
	await ctx.role.save();
	ctx.body = {
		items: data.items,
	}
}
