
'use strict'

// 用元宝等道具购买礼包
module.exports = exports = async function (ctx, next) {
	let {hdlb = 'unknow'} = ctx.params;
	let { index } = ctx.request.body;
	index = parseInt(index);
	let info = ctx.config[index];
	ctx.assert(info, 'invalid index');
	ctx.assert(info.COST, 'invalid cost');
	let bought = ctx.role[hdlb][index] || 0;
	ctx.assert(bought < info.LIMIT, 'no more');
	ctx.role[hdlb][index] = ++bought;
	ctx.role.markModified(hdlb);
	ctx.role.castItemsNoSave(info.COST);
	let reward = info.ITEMS;
	if(info.SPECIAL) reward = [...reward, ...info.SPECIAL];
	ctx.role.addItemsNoSave(reward);
	await ctx.role.save();
	ctx.body = info.ITEMS;
}