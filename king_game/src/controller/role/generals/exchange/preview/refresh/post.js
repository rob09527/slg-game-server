
'use strict'

module.exports = exports = async (ctx, next) =>{
	ctx.general = await ctx.role.findGenerals(ctx.request.body.guid);
	ctx.assert(ctx.general, 'general nexists');
	if (!ctx.exchange) ctx.exchange = new ctx.dao.c_exchange({rid: ctx.role._id});
	ctx.exchange.general = ctx.request.body.guid;
	ctx.exchange.update = Date.now();
	let config = global.gameconfig.general[ctx.general.gsid];
	ctx.assert(config, 'invalid gsid');
	const star = config.STAR;
	const camp = config.CAMP;
	config = global.gameconfig.exchangecast[config.CAMP - 1];
	ctx.assert(config, 'invalid camp');
	config = config.deepQueryOne('STAR', star);
	ctx.assert(config, 'star nexist');

	ctx.role.castItemsNoSave(config.ITEMS, {main: 'general', sec: 'exchange'});

	config = global.gameconfig.exchangepool.filter(function (g) {
		let info = global.gameconfig.general[g.ID];
		ctx.assert(info, 'invalid pgsid');
		return ctx.general.gsid !== g.ID && info.STAR == star && info.CAMP == camp
		&& ctx.role.level >= g.MINLV && ctx.role.level <= g.MAXLV
		&& ctx.role.vip >= g.MINVIP && ctx.role.vip <= g.MAXVIP;
	})

	const rates = config.deepMap('CHANCE');
	const item = config[ctx.random.inweight(rates)];
	ctx.assert(item, 'invalid item');
	ctx.exchange.gsid = item.ID;
	await ctx.exchange.save();
	// 积分宝箱-置换5星五星武将获得积分
	if (star == 5) ctx.zhdpoint("JFBX", ctx.role, 1, 90351);
	await ctx.role.missionInvoke('GENERAL_EXCHANGE_DAILY_HISTORY').save();
	// 珍宝增幅任务
	await ctx.role.zhenbaoMissionInvoke({missionName: 'GENERAL_EXCHANGE'});
}
