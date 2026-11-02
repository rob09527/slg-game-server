
'use strict'

module.exports = exports = async (ctx, next) =>{
	const config = global.gameconfig.refreshactivity;
	for (const info of config) {
		const item = ctx.role.others[info.GSID];
		if (info.COUNT == 0 && !item) continue;
		if (info.COUNT == item.count) continue;
		item.count = info.COUNT;
		ctx.role.markModified('others.' + info.GSID + '.count');
	}
	// 打开红点
	ctx.dao.remind.updateOne({rid: ctx.role.i() },{$set: { 'remind.ydhd_ydhd': 1} }).catch(console.error);
	if (ctx.role.special.yd) {
		ctx.role.special.yd = 0;
		ctx.role.markModified('special.yd');
	}
	await ctx.role.save();
	ctx.body = {};
}
