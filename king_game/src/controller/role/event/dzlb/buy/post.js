
'use strict'

module.exports = exports = async function (ctx, next) {
	let {
		id,
		optionindex,
	} = ctx.request.body;
	let config = global.gameconfig.dzlb.deepQueryOne('ID', Number.parseInt(id));
	ctx.assert(config, 'invalid id');
	let dzlbData = ctx.role.dzlb || {} ;
	let buytime = dzlbData[id] || 0;
	ctx.assert(buytime < config.LIMIT, 'no more');
	let out = [];
	optionindex.forEach((choice, index) =>{
		let poolId = config.CHOICE[index];
		ctx.assert(poolId, "invalid choice");
		let pool = global.gameconfig.dzlbchoice[poolId];
		ctx.assert(pool, "invalid pool");
		let item = pool[choice];
		ctx.assert(item, "invalid item");
		out.push(item);
	});
	out.push(...config.ITEMS);
	ctx.role.castItemsNoSave(config.COST);
	ctx.role.addItemsNoSave(out);
	dzlbData[id] = dzlbData[id] || 0;
	dzlbData[id]++;
	ctx.role.dzlb = dzlbData;
	ctx.role.markModified('dzlb');
	await ctx.role.save();
	ctx.body = out;
	// 周活动日志-定制礼包
	ctx.zhdprint("dzlb", id, out.map(({ GSID, COUNT }) => [GSID, COUNT].join(",")).join(","));
}