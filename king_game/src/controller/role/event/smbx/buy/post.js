
'use strict'
// 神秘宝箱-购买
module.exports = exports = async function (ctx, next) {
	let {index} = ctx.request.body;
	index = parseInt(index);
	let {SMBX} = global.gameconfig.zhd;
	let config = SMBX[index];
	ctx.assert(config, 'invalid pindex');

	ctx.assert(ctx.role.vip >= config.VIP, 'vip limit');

	let record = ctx.role.smbx || [];
	let bought = record[index] || 0;
	ctx.assert(config.LIMIT > bought, 'no more');

	ctx.role.castItemsNoSave(config.CAST);
    ctx.role.addItemsNoSave(config.ITEMS);
    
	record[index] = ++bought;
	ctx.role.smbx = record;
	ctx.role.markModified('smbx');
    await ctx.role.save();
	ctx.body = {};
	// 周活动日志-神秘宝箱(也叫元宝限购),index => 购买的档次
	ctx.zhdprint("smbx", index)
}