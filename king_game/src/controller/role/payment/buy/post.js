
'use strict'

module.exports = exports = async function (ctx, next) {
	let {pid} = ctx.request.body;
	const config = global.gameconfig.right[pid];
	ctx.assert(config && config.COIN === 'YB', 'invalid pid');
	pid = pid.replace('special', '');
	const endtime = ctx.role.special[pid] || 0;
	ctx.assert(endtime < Date.now(), 'not expire');
	if (config.DAY > 0) {
		ctx.role.special[pid] = Date.now() + config.DAY * 24 * 60 * 60 * 1000;
	}else{
		ctx.role.special[pid] = 9999999999999;
	}
	ctx.role.markModified('special');
	ctx.role.castItemsNoSave({gsid: 38005, count: config.NUM});
	ctx.role.addItemsNoSave(config.REWARD);
	await ctx.role.save();
	ctx.body = config.REWARD;
	// 打印元宝套餐消耗元宝数量日志
	ctx.khlog.ybcastprint('YBTQ', ctx.role.uid, {gsid: 38005, count: config.NUM});
}