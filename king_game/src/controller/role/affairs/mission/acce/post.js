
'use strict'

/**
 * 内政加速
 * @deprecated 废弃
 * @author awko 改
 * @type {exports}
 */
module.exports = exports = async (ctx, next) => {
	assert.fail('请升级客户端');
	ctx.assert(ctx.mission.etime, 'not start');
	ctx.assert(Date.now() < ctx.mission.etime, 'already finish');
	const config = global.gameconfig.affairs.deepQueryOne('ID', ctx.mission.id);
	ctx.assert(config, 'invalid mission');
	if (config.CAST) {
		ctx.role.castItemsNoSave({gsid: 38005, count: config.CAST});
		await ctx.role.save();
	}
	ctx.mission.etime = Date.now();
	// 打印招募消耗元宝数量日志
	ctx.khlog.ybcastprint('missionacce', ctx.role.uid, {gsid: 38005, count: config.CAST});
}
