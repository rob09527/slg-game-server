
'use strict'
// 工坊捐赠
const donation_limithour = global.gameconfig.others.LEGION.LEGION_DONATION_LIMIT_HOUR;
const donation_day_count = global.gameconfig.others.LEGION.DONATION_DAY_COUNT;
module.exports = exports = async (ctx, next) => {
	let { type } = ctx.request.body;
	// type 0 查军团工坊
	// type 1 普通捐赠
	// type 2 高级捐赠
	ctx.assert(type >= 0, 'invalid type');
	ctx.body = {
		lv: ctx.legion.flevel,
		exp: ctx.legion.fexp
	};
	let newman = Date.now() - ctx.role.legionjointime > donation_limithour * 3600 * 1000 ? 0 : 1
	if (newman) ctx.body.newman = newman;
	if (type === 0) return;
	// 判断捐赠次数
	ctx.assert(ctx.role.getItems(90391).count < donation_day_count, 'no more');
	// 判断捐赠消耗
	let config = global.gameconfig.legionfdonation[type];
	ctx.assert(config, 'legionfdonation config err');
	config = config[ctx.role.getItems(90391).count];
	let castItems = config.CASTITEMS;
	let addExp = config.ADDEXP;
	ctx.legion._fexp += addExp;
	ctx.role.castItemsNoSave(castItems);
	ctx.role.addItemsNoSave(90391);
	// 捐赠奖励
	if (config.ITEMS && config.ITEMS.length > 0) {
		ctx.role.addItemsNoSave(config.ITEMS);
		ctx.body.rewards = config.ITEMS;
	}
	// 记录贡献金额
	let rid = ctx.role.i();
	let cur_val = ctx.legion.donation[rid] || { count: 0, last: -1 };
	cur_val.count += addExp;
	cur_val.last = Date.now();
	ctx.legion.donation[rid] = cur_val;
	ctx.legion.markModified('donation.' + rid);
	ctx.body.exp = ctx.legion.fexp;
	ctx.body.lv = ctx.legion.flevel;
	await ctx.role.save();
	await ctx.legion.save();
}
