
'use strict'

module.exports = exports = async (ctx, next) =>{
	let {
		potion,
		guid,
	} = ctx.request.body;
	// 检查缓存是否存在
	ctx.assert(ctx.dginfo, 'setg first');
	ctx.assert(ctx.dginfo.potion[potion] && ctx.dginfo.potion[potion] > 0, 'nomore potion');
	// 扣除药水数量1
	ctx.dginfo.potion[potion]--;
	ctx.dginfo.markModified('potion.'+potion);
	// 检查武将是否存在
	let general = ctx.dginfo.generals[guid];
	ctx.assert(general, 'invalid guid');
	// 检查武将血量
	ctx.assert(general.hppercent < 10000, 'hp full');
	general.hppercent = Math.min(general.hppercent += 5000, 10000);
	ctx.dginfo.markModified('generals.'+guid);
	// 保存数据
	await ctx.dginfo.save();
	ctx.body = {
		guid,
		hppercent: ctx.dginfo.generals[guid].hppercent || 10000,
	}
}