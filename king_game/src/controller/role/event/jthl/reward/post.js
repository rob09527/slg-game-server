
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		index,
	} = ctx.request.body;
	index = Number.parseInt(index);
	let config = ctx.config.REWARDS[index];
	ctx.assert(config, 'invalid index');
	let {
		DAYS,
		ITEMS,
		RMARK,
	} = config;
	let record = ctx.role.jthl || [];
	ctx.assert((ctx.mode == "zhd" ? ctx.role.getProp(RMARK) : (record[index] || 0)) == 0, 'already take');
	let total_days = ctx.role.getProp(ctx.config.MARK);
	ctx.assert(total_days >= DAYS, 'not yet');
	let addMarks = [...ITEMS];
	let castitems = [];
	if(ctx.mode == "zhd") {
		 addMarks.push({ GSID: RMARK, COUNT: 1});
	} else {
		record[index] = 1;
		const rewardDays = ctx.config.REWARDS.length;
		if ( record.filter(Boolean).length === rewardDays ) {
			console.log('REFRESH JTHL', ctx.role.rno, record.join(','));
			record = [];
			castitems = [{
				gsid: ctx.config.MARK,
				count: rewardDays
			}];
			ctx.role.castItemsNoSave(castitems);
		}
		ctx.role.jthl = record;
		ctx.role.markModified("jthl");
	}
	ctx.role.addItemsNoSave(addMarks);
	await ctx.role.save();
	ctx.body = {
		items: ITEMS,
		castitems: castitems
	};
	// 周活动日志-积天豪礼
	if(ctx.mode == "zhd") ctx.zhdprint("jthl", index);
}
